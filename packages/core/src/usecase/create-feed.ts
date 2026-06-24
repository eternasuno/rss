import { DateTime, Effect, Schema } from 'effect';
import { type Feed, FeedId } from '../entity/feed.js';
import { ExtraData, UserId } from '../entity/value-object.js';
import { FeedRepository } from '../port/feed-repository.js';

export const CreateFeedInput = Schema.Struct({
  description: Schema.NonEmptyTrimmedString,
  extraData: Schema.optionalWith(ExtraData, { default: () => ({}) }),
  link: Schema.URL,
  title: Schema.NonEmptyTrimmedString,
  userId: UserId,
});

export type CreateFeedInput = typeof CreateFeedInput.Type;

const newFeedId = () => Effect.sync(() => FeedId.make(crypto.randomUUID()));

export const createFeed = (input: CreateFeedInput) =>
  Effect.gen(function* () {
    const feedRepo = yield* FeedRepository;
    const feedId = yield* newFeedId();
    const nowUtc = yield* DateTime.now;
    const now = new Date(nowUtc.epochMillis);
    const feed: Feed = {
      createdAt: now,
      description: input.description,
      extraData: input.extraData,
      id: feedId,
      link: input.link,
      title: input.title,
      updatedAt: now,
      userId: input.userId,
    };

    return yield* feedRepo.create(feed);
  });
