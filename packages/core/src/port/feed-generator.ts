import { Context, Effect } from "effect"
import { AppError } from "./app-error.js"
import { Feed } from "../entity/feed.js"
import { Item } from "../entity/item.js"

export interface IFeedGenerator {
  readonly generateFeedXml: (params: {
    readonly feed: Feed
    readonly items: ReadonlyArray<Item>
  }) => Effect.Effect<string, AppError, never>
}

export class FeedGenerator extends Context.Tag("FeedGenerator")<FeedGenerator, IFeedGenerator>() {}
