import { Context, Effect, Option } from "effect"
import { AppError } from "./app-error.js"
import { Item, ItemId } from "../entity/item.js"
import { FeedId } from "../entity/feed.js"

export interface IItemRepository {
  readonly create: (item: Item) => Effect.Effect<Item, AppError, never>
  readonly findById: (id: ItemId) => Effect.Effect<Option.Option<Item>, AppError, never>
  readonly findByFeedId: (feedId: FeedId) => Effect.Effect<ReadonlyArray<Item>, AppError, never>
  readonly delete: (id: ItemId) => Effect.Effect<void, AppError, never>
}

export class ItemRepository extends Context.Tag("ItemRepository")<ItemRepository, IItemRepository>() {}
