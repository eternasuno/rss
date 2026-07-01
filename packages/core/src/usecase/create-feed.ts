import { DateTime, Effect, Schema } from 'effect';
import { type Feed, FeedData, FeedId } from '../entity/feed';
import { UserId } from '../entity/value-object';
import { Crypto } from '../port/crypto';
import { FeedRepository } from '../port/feed-repository';

export const CreateFeedParams = Schema.Struct({
  data: FeedData,
  userId: UserId,
});

export type CreateFeedParams = typeof CreateFeedParams.Type;

export const createFeed = (input: CreateFeedParams) =>
  Effect.gen(function* () {
    const crypto = yield* Crypto;
    const feedRepo = yield* FeedRepository;

    const createdAt = yield* DateTime.now;
    const id = FeedId.make(yield* crypto.generateUUId);
    const feed: Feed = { ...input, createdAt, id };

    return yield* feedRepo.create(feed);
  });
