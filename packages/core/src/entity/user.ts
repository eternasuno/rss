import { Schema } from 'effect';
import { Email } from './value-object.js';

export const UserId = Schema.String.pipe(Schema.brand('UserId'));

export type UserId = typeof UserId.Type;

export const User = Schema.Struct({
  email: Email,
  id: UserId,
  passwordHash: Schema.String,
});

export type User = typeof User.Type;
