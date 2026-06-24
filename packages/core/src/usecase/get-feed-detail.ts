import { Effect, Option } from 'effect';
import type { Feed, FeedId } from '../entity/feed.js';
import type { Item } from '../entity/item.js';
import { AppError } from '../port/app-error.js';
import { FeedRepository } from '../port/feed-repository.js';
import { ItemRepository } from '../port/item-repository.js';

export const getFeedDetail = (feedId: FeedId) =>
  Effect.gen(function* () {
    const feedRepo = yield* FeedRepository;
    const itemRepo = yield* ItemRepository;
    const found = yield* feedRepo.findById(feedId);

    if (Option.isNone(found)) {
      return yield* new AppError({ code: 'NOT_FOUND', message: 'Feed not found' });
    }

    const feed: Feed = found.value;
    const items: ReadonlyArray<Item> = yield* itemRepo.findByFeedId(feedId);

    return { feed, items };
  });
