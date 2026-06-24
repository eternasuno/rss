import { Schema } from 'effect';

export const Email = Schema.NonEmptyTrimmedString.pipe(
  Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  Schema.brand('Email')
);

export type Email = typeof Email.Type;

export const Password = Schema.NonEmptyTrimmedString.pipe(
  Schema.maxLength(128),
  Schema.pattern(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"|,.<>/?`~]).{8,}$/
  ),
  Schema.brand('Password')
);

export type Password = typeof Password.Type;
