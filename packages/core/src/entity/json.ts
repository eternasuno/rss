import { Schema } from "effect"

export type JSONValue =
  | string
  | number
  | boolean
  | null
  | ReadonlyArray<JSONValue>
  | { readonly [key: string]: JSONValue }

export const JSONValue: Schema.Schema<JSONValue> = Schema.Union(
  Schema.String,
  Schema.Number,
  Schema.Boolean,
  Schema.Null,
  Schema.Array(Schema.suspend((): Schema.Schema<JSONValue> => JSONValue)),
  Schema.Record({
    key: Schema.String,
    value: Schema.suspend((): Schema.Schema<JSONValue> => JSONValue),
  })
)

export const ExtraData = Schema.Record({
  key: Schema.String,
  value: JSONValue,
})
export type ExtraData = Schema.Schema.Type<typeof ExtraData>
