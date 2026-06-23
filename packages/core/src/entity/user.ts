import { Schema } from "effect"

export class User extends Schema.Class<User>("User")({
  id: Schema.UUID,
  email: Schema.NonEmptyString,
}) {}
