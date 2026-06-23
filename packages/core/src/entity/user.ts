import { Schema } from "effect"

export const UserId = Schema.String.pipe(Schema.brand("UserId"))
export type UserId = Schema.Schema.Type<typeof UserId>

export const User = Schema.Struct({
  id: UserId,
  email: Schema.NonEmptyTrimmedString,
})
export type User = Schema.Schema.Type<typeof User>
