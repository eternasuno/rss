import { Context, type Effect } from 'effect';
import type { CredentialId, CredentialKind } from '../entity/credential.js';
import type { UserId } from '../entity/user.js';
import type { AppError } from './app-error.js';

export interface ICryptoService {
  readonly hash: (plaintext: string) => Effect.Effect<string, AppError, never>;

  readonly sign: (payload: {
    readonly userId: UserId;
    readonly credentialId: CredentialId;
    readonly kind: CredentialKind;
    readonly expiresAt: Date;
  }) => Effect.Effect<string, AppError, never>;

  readonly verify: (token: string) => Effect.Effect<
    {
      readonly userId: UserId;
      readonly credentialId: CredentialId;
      readonly kind: CredentialKind;
    },
    AppError,
    never
  >;
}

export class CryptoService extends Context.Tag('CryptoService')<
  CryptoService,
  ICryptoService
>() {}
