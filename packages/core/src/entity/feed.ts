import { Schema } from "effect"
import { ExtraData } from "./json.js"

export class Feed extends Schema.Class<Feed>("Feed")({
  id: Schema.UUID,
  userId: Schema.UUID,
  title: Schema.NonEmptyString,
  description: Schema.NonEmptyString,
  link: Schema.URL,
  extraData: ExtraData,
  createdAt: Schema.Date,
  updatedAt: Schema.Date,
}) {}
