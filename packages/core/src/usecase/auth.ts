import { DateTime, Duration, Effect, Option, Schema } from 'effect';
import { type Credential, CredentialId } from '../entity/credential.js';
import { type User, UserId } from '../entity/user.js';
import { Email, Password } from '../entity/value-object.js';
import { AppError } from '../port/app-error.js';
import { CredentialRepository } from '../port/credential-repository.js';
import { CryptoService } from '../port/crypto-service.js';
import { UserRepository } from '../port/user-repository.js';

export const RegisterInput = Schema.Struct({
  email: Email,
  password: Password,
  userAgent: Schema.optional(Schema.NonEmptyTrimmedString),
});

export type RegisterInput = typeof RegisterInput.Type;

export const LoginInput = Schema.Struct({
  email: Email,
  password: Schema.NonEmptyTrimmedString,
  userAgent: Schema.optional(Schema.NonEmptyTrimmedString),
});

export type LoginInput = typeof LoginInput.Type;

const SESSION_TTL = Duration.days(1);

const API_KEY_TTL = Duration.days(10 * 365);

const LAST_USED_UPDATE_INTERVAL = Duration.minutes(5);

const newUserId = () => Effect.sync(() => UserId.make(crypto.randomUUID()));

const newCredentialId = () => Effect.sync(() => CredentialId.make(crypto.randomUUID()));

const makeSessionCredential = (params: {
  readonly credentialId: CredentialId;
  readonly nowUtc: DateTime.Utc;
  readonly userAgent: string | undefined;
  readonly userId: UserId;
}): Credential => ({
  createdAt: new Date(params.nowUtc.epochMillis),
  expiresAt: new Date(DateTime.addDuration(params.nowUtc, SESSION_TTL).epochMillis),
  id: params.credentialId,
  kind: 'session',
  lastUsedAt: new Date(params.nowUtc.epochMillis),
  userAgent: params.userAgent,
  userId: params.userId,
});

const createSession = (params: {
  readonly userId: UserId;
  readonly userAgent: string | undefined;
}) =>
  Effect.gen(function* () {
    const credentialRepo = yield* CredentialRepository;
    const crypto = yield* CryptoService;
    const credentialId = yield* newCredentialId();
    const nowUtc = yield* DateTime.now;
    const credential = makeSessionCredential({
      credentialId,
      nowUtc,
      userAgent: params.userAgent,
      userId: params.userId,
    });
    yield* credentialRepo.create(credential);
    const token = yield* crypto.sign({
      credentialId,
      expiresAt: credential.expiresAt,
      kind: 'session',
      userId: params.userId,
    });
    return { token };
  });

const verifyPassword = (params: { readonly plaintext: string; readonly storedHash: string }) =>
  Effect.gen(function* () {
    const crypto = yield* CryptoService;
    const hash = yield* crypto.hash(params.plaintext);

    return hash === params.storedHash;
  });

const touchLastUsed = (params: {
  readonly credentialId: CredentialId;
  readonly lastUsedAt: Date;
}) =>
  Effect.gen(function* () {
    const nowUtc = yield* DateTime.now;
    const lastUsedUtc = DateTime.unsafeFromDate(params.lastUsedAt);
    const elapsed = DateTime.distanceDuration(lastUsedUtc, nowUtc);

    if (Duration.greaterThan(elapsed, LAST_USED_UPDATE_INTERVAL)) {
      const repo = yield* CredentialRepository;

      yield* repo.updateLastUsedAt(params.credentialId);
    }
  });

export const register = (input: RegisterInput) =>
  Effect.gen(function* () {
    const userRepo = yield* UserRepository;
    const existing = yield* userRepo.findByEmail(input.email);

    if (Option.isSome(existing)) {
      return yield* new AppError({ code: 'CONFLICT', message: 'Email already registered' });
    }

    const crypto = yield* CryptoService;
    const hash = yield* crypto.hash(input.password);
    const userId = yield* newUserId();
    const user: User = { email: input.email, id: userId, passwordHash: hash };

    yield* userRepo.create(user);

    const session = yield* createSession({ userAgent: input.userAgent, userId });

    return { token: session.token, user };
  });

export const login = (input: LoginInput) =>
  Effect.gen(function* () {
    const userRepo = yield* UserRepository;
    const found = yield* userRepo.findByEmail(input.email);
    if (Option.isNone(found)) {
      return yield* new AppError({
        code: 'AUTHENTICATION_ERROR',
        message: 'Invalid email or password',
      });
    }

    const user = found.value;
    const valid = yield* verifyPassword({
      plaintext: input.password,
      storedHash: user.passwordHash,
    });
    if (!valid) {
      return yield* new AppError({
        code: 'AUTHENTICATION_ERROR',
        message: 'Invalid email or password',
      });
    }

    const session = yield* createSession({ userAgent: input.userAgent, userId: user.id });

    return { token: session.token, user };
  });

export const logout = (credentialId: CredentialId) =>
  Effect.gen(function* () {
    const repo = yield* CredentialRepository;

    yield* repo.delete(credentialId);
  });

export const validateCredential = (token: string) =>
  Effect.gen(function* () {
    const crypto = yield* CryptoService;
    const payload = yield* crypto.verify(token);
    const credentialRepo = yield* CredentialRepository;
    const found = yield* credentialRepo.findById(payload.credentialId);

    if (Option.isNone(found)) {
      return yield* new AppError({
        code: 'AUTHENTICATION_ERROR',
        message: 'Credential not found or revoked',
      });
    }

    const credential = found.value;
    const nowUtc = yield* DateTime.now;

    if (DateTime.lessThan(DateTime.unsafeFromDate(credential.expiresAt), nowUtc)) {
      return yield* new AppError({ code: 'AUTHENTICATION_ERROR', message: 'Credential expired' });
    }

    yield* touchLastUsed({ credentialId: credential.id, lastUsedAt: credential.lastUsedAt });

    return { credentialId: payload.credentialId, kind: payload.kind, userId: payload.userId };
  });

export const createApiKey = (userId: UserId) =>
  Effect.gen(function* () {
    const credentialRepo = yield* CredentialRepository;
    const credentialId = yield* newCredentialId();
    const nowUtc = yield* DateTime.now;
    const now = new Date(nowUtc.epochMillis);
    const expiresAt = new Date(DateTime.addDuration(nowUtc, API_KEY_TTL).epochMillis);
    const credential: Credential = {
      createdAt: now,
      expiresAt,
      id: credentialId,
      kind: 'api_key',
      lastUsedAt: now,
      userId,
    };

    yield* credentialRepo.create(credential);
    const crypto = yield* CryptoService;
    const token = yield* crypto.sign({ credentialId, expiresAt, kind: 'api_key', userId });
    return { credential, token };
  });

export const deleteApiKey = (credentialId: CredentialId) =>
  Effect.gen(function* () {
    const repo = yield* CredentialRepository;

    yield* repo.delete(credentialId);
  });
