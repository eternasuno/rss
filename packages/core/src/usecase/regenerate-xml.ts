import { Effect, Option } from 'effect';
import type { FeedId } from '../entity/feed';
import { AppError } from '../port/app-error';
import { FeedGenerator } from '../port/feed-generator';
import { FeedRepository } from '../port/feed-repository';
import { ItemRepository } from '../port/item-repository';

export const regenerateXml = (feedId: FeedId) =>
  Effect.gen(function* () {
    const feedRepo = yield* FeedRepository;
    const itemRepo = yield* ItemRepository;
    const feedGenerator = yield* FeedGenerator;

    const found = yield* feedRepo.findById(feedId);

    if (Option.isNone(found)) {
      return yield* new AppError({ code: 'NOT_FOUND', message: 'Feed not found' });
    }

    const feed = found.value;
    const items = yield* itemRepo.findByFeedId(feed.id);

    const xml = yield* feedGenerator.generateFeedXml({ feed, items });

    return xml;
  });
