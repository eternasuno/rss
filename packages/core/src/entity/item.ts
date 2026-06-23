import { Schema } from "effect"
import { ExtraData } from "./json.js"
import { FeedId } from "./feed.js"

export const ItemId = Schema.String.pipe(Schema.brand("ItemId"))
export type ItemId = Schema.Schema.Type<typeof ItemId>

export const Item = Schema.Struct({
  id: ItemId,
  feedId: FeedId,
  title: Schema.NonEmptyTrimmedString,
  extraData: ExtraData,
  createdAt: Schema.Date,
})
export type Item = Schema.Schema.Type<typeof Item>
