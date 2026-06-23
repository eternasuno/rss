import { Schema } from "effect"
import { ExtraData } from "./json.js"

export class Item extends Schema.Class<Item>("Item")({
  id: Schema.UUID,
  feedId: Schema.UUID,
  title: Schema.NonEmptyString,
  extraData: ExtraData,
  createdAt: Schema.Date,
}) {}
