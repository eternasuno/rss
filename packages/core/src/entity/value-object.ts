import { Schema } from 'effect';

export const UserId = Schema.String.pipe(Schema.brand('UserId'));

export type UserId = typeof UserId.Type;

export type JSONValue =
  | string
  | number
  | boolean
  | null
  | ReadonlyArray<JSONValue>
  | { readonly [key: string]: JSONValue };

export const JSONValue: Schema.Schema<JSONValue> = Schema.Union(
  Schema.String,
  Schema.Number,
  Schema.Boolean,
  Schema.Null,
  Schema.Array(Schema.suspend(() => JSONValue)),
  Schema.Record({ key: Schema.String, value: Schema.suspend(() => JSONValue) })
);

export const ExtraData = Schema.Record({ key: Schema.String, value: JSONValue });

export type ExtraData = typeof ExtraData.Type;
