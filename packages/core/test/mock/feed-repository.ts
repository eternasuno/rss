import { Effect, Layer, Option } from 'effect';
import { FeedRepository, type IFeedRepository } from '../../src/port/feed-repository';
import { sampleFeed } from './data/feed';

const mockFeedRepository: IFeedRepository = {
  create: (feed) => Effect.succeed(feed),
  delete: () => Effect.void,
  findById: () => Effect.succeed(Option.some(sampleFeed)),
  findByUserId: () => Effect.succeed([sampleFeed]),
  update: () => () => Effect.void,
};

export const FeedRepositoryTest = Layer.succeed(FeedRepository, mockFeedRepository);

const mockFeedRepositoryEmpty: IFeedRepository = {
  create: (feed) => Effect.succeed(feed),
  delete: () => Effect.void,
  findById: () => Effect.succeed(Option.none()),
  findByUserId: () => Effect.succeed([]),
  update: () => () => Effect.void,
};

export const FeedRepositoryEmpty = Layer.succeed(FeedRepository, mockFeedRepositoryEmpty);
