import { Schema } from "effect"
import { UserId } from "./user.js"

export const ApiKeyId = Schema.String.pipe(Schema.brand("ApiKeyId"))
export type ApiKeyId = Schema.Schema.Type<typeof ApiKeyId>

export const ApiKey = Schema.Struct({
  id: ApiKeyId,
  key: Schema.NonEmptyTrimmedString,
  userId: UserId,
  expiresAt: Schema.Date,
  lastUsedAt: Schema.Date,
  createdAt: Schema.Date,
})
export type ApiKey = Schema.Schema.Type<typeof ApiKey>
