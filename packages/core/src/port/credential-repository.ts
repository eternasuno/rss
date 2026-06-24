import { Context, type Effect, type Option } from 'effect';
import type { Credential, CredentialId } from '../entity/credential.js';
import type { UserId } from '../entity/user.js';
import type { AppError } from './app-error.js';

export interface ICredentialRepository {
  readonly create: (credential: Credential) => Effect.Effect<Credential, AppError, never>;

  readonly findById: (
    id: CredentialId
  ) => Effect.Effect<Option.Option<Credential>, AppError, never>;

  readonly findByUserId: (
    userId: UserId
  ) => Effect.Effect<ReadonlyArray<Credential>, AppError, never>;

  readonly updateLastUsedAt: (id: CredentialId) => Effect.Effect<void, AppError, never>;

  readonly delete: (id: CredentialId) => Effect.Effect<void, AppError, never>;
}

export class CredentialRepository extends Context.Tag('CredentialRepository')<
  CredentialRepository,
  ICredentialRepository
>() {}
