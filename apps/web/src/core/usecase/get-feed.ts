import { Effect } from 'effect';
import type { FeedId } from '../entity/feed';
import { AppError } from '../port/app-error';
import { FeedRepository } from '../port/feed-repository';
import { ItemRepository } from '../port/item-repository';

export const getFeed = (feedId: FeedId) =>
  Effect.gen(function* () {
    const feedRepo = yield* FeedRepository;
    const itemRepo = yield* ItemRepository;

    const feed = yield* feedRepo.findById(feedId).pipe(
      Effect.flatten,
      Effect.catchTag(
        'NoSuchElementException',
        () => new AppError({ code: 'NOT_FOUND', message: 'Feed not found' })
      )
    );

    const items = yield* itemRepo.findByFeedId(feedId);

    return { feed, items };
  });
