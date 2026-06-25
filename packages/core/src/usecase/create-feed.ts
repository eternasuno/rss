import { DateTime, Effect, Schema } from 'effect';
import { type Feed, FeedData, FeedId } from '../entity/feed';
import { UserId } from '../entity/value-object';
import { Crypto } from '../port/crypto';
import { FeedRepository } from '../port/feed-repository';

export const CreateFeedInput = Schema.Struct({
  data: FeedData,
  userId: UserId,
});

export type CreateFeedInput = typeof CreateFeedInput.Type;

export const createFeed = (input: CreateFeedInput) =>
  Effect.gen(function* () {
    const crypto = yield* Crypto;
    const feedRepo = yield* FeedRepository;
    const feedId = FeedId.make(yield* crypto.generateUUId());
    const now = yield* DateTime.now;
    const feed: Feed = {
      createdAt: now,
      data: input.data,
      id: feedId,
      userId: input.userId,
    };

    return yield* feedRepo.create(feed);
  });
