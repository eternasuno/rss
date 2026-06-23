import { Schema } from "effect"

export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { readonly [key: string]: JSONValue }

const isJSONValue = (u: unknown): u is JSONValue => {
  if (u === null) return true
  if (typeof u === "string") return true
  if (typeof u === "number") return true
  if (typeof u === "boolean") return true
  if (Array.isArray(u)) return u.every(isJSONValue)
  if (typeof u === "object") return Object.values(u as Record<string, unknown>).every(isJSONValue)
  return false
}

const jsonValueSchema = Schema.declare(isJSONValue)

export type ExtraData = Record<string, JSONValue>

export const ExtraData = Schema.Record({
  key: Schema.String,
  value: jsonValueSchema,
}) as Schema.Schema<ExtraData>
