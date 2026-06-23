import { Context, Effect, Option } from "effect"
import { AppError } from "./app-error.js"
import { Feed, FeedId } from "../entity/feed.js"
import { UserId } from "../entity/user.js"

export interface IFeedRepository {
  readonly create: (feed: Feed) => Effect.Effect<Feed, AppError, never>
  readonly findById: (id: FeedId) => Effect.Effect<Option.Option<Feed>, AppError, never>
  readonly findByUserId: (userId: UserId) => Effect.Effect<ReadonlyArray<Feed>, AppError, never>
  readonly update: (params: { readonly id: FeedId; readonly data: Partial<typeof Feed.Encoded> }) => Effect.Effect<void, AppError, never>
  readonly delete: (id: FeedId) => Effect.Effect<void, AppError, never>
}

export class FeedRepository extends Context.Tag("FeedRepository")<FeedRepository, IFeedRepository>() {}
