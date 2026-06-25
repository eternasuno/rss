import { Context, type Effect, type Option } from 'effect';
import type { FeedId } from '../entity/feed';
import type { Item, ItemId } from '../entity/item';
import type { AppError } from './app-error';

export interface IItemRepository {
  readonly create: (item: Item) => Effect.Effect<Item, AppError, never>;
  readonly findById: (id: ItemId) => Effect.Effect<Option.Option<Item>, AppError, never>;
  readonly findByFeedId: (feedId: FeedId) => Effect.Effect<ReadonlyArray<Item>, AppError, never>;
  readonly delete: (id: ItemId) => Effect.Effect<void, AppError, never>;
}

export class ItemRepository extends Context.Tag('ItemRepository')<
  ItemRepository,
  IItemRepository
>() {}
