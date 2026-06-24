import { Schema } from 'effect';
import { UserId } from './user.js';

export const CredentialId = Schema.String.pipe(Schema.brand('CredentialId'));

export type CredentialId = typeof CredentialId.Type;

export const CredentialKind = Schema.Literal('session', 'api_key');

export type CredentialKind = typeof CredentialKind.Type;

export const Credential = Schema.Struct({
  createdAt: Schema.Date,
  expiresAt: Schema.Date,
  id: CredentialId,
  kind: CredentialKind,
  lastUsedAt: Schema.Date,
  userAgent: Schema.optional(Schema.NonEmptyTrimmedString),
  userId: UserId,
});

export type Credential = typeof Credential.Type;
