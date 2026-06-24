import { Effect, Option } from 'effect';
import type { FeedId } from '../entity/feed.js';
import { AppError } from '../port/app-error.js';
import { FeedRepository } from '../port/feed-repository.js';
import { ItemRepository } from '../port/item-repository.js';

export const getFeed = (feedId: FeedId) =>
  Effect.gen(function* () {
    const feedRepo = yield* FeedRepository;
    const itemRepo = yield* ItemRepository;

    const found = yield* feedRepo.findById(feedId);

    if (Option.isNone(found)) {
      return yield* new AppError({ code: 'NOT_FOUND', message: 'Feed not found' });
    }

    const feed = found.value;
    const items = yield* itemRepo.findByFeedId(feedId);

    return { feed, items };
  });
