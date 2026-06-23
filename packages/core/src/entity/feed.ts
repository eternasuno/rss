import { Schema } from "effect"
import { ExtraData } from "./json.js"
import { UserId } from "./user.js"

export const FeedId = Schema.String.pipe(Schema.brand("FeedId"))
export type FeedId = Schema.Schema.Type<typeof FeedId>

export const Feed = Schema.Struct({
  id: FeedId,
  userId: UserId,
  title: Schema.NonEmptyTrimmedString,
  description: Schema.NonEmptyTrimmedString,
  link: Schema.URL,
  extraData: ExtraData,
  createdAt: Schema.Date,
  updatedAt: Schema.Date,
})
export type Feed = Schema.Schema.Type<typeof Feed>
