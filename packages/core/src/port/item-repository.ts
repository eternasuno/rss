import { Context, type Effect, type Option } from 'effect';
import type { FeedId } from '../entity/feed';
import type { Item, ItemData, ItemId } from '../entity/item';
import type { AppError } from './app-error';

export interface IItemRepository {
  readonly create: (item: Item) => Effect.Effect<void, AppError, never>;
  readonly delete: (ids: ReadonlyArray<ItemId>) => Effect.Effect<void, AppError, never>;
  readonly findById: (id: ItemId) => Effect.Effect<Option.Option<Item>, AppError, never>;
  readonly findByFeedId: (feedId: FeedId) => Effect.Effect<ReadonlyArray<Item>, AppError, never>;
  readonly update: (
    id: ItemId
  ) => (params: Partial<ItemData>) => Effect.Effect<void, AppError, never>;
}

export class ItemRepository extends Context.Tag('ItemRepository')<
  ItemRepository,
  IItemRepository
>() {}
