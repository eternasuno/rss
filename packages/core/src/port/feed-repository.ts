import { Context, type Effect, type Option } from 'effect';
import type { Feed, FeedData, FeedId } from '../entity/feed';
import type { UserId } from '../entity/value-object';
import type { AppError } from './app-error';

export interface IFeedRepository {
  readonly create: (feed: Feed) => Effect.Effect<Feed, AppError, never>;
  readonly findById: (id: FeedId) => Effect.Effect<Option.Option<Feed>, AppError, never>;
  readonly findByUserId: (userId: UserId) => Effect.Effect<ReadonlyArray<Feed>, AppError, never>;
  readonly update: (id: FeedId) => (params: Partial<FeedData>) => Effect.Effect<void, AppError, never>;
  readonly delete: (ids:ReadonlyArray<FeedId>) => Effect.Effect<void, AppError, never>;
}

export class FeedRepository extends Context.Tag('FeedRepository')<
  FeedRepository,
  IFeedRepository
>() {}
