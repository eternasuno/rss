import { type FeedId, FeedData, ItemData, UserId } from '@rss/core/entity';
import { FeedRepository } from '@rss/core/port';
import { addItem, createFeed, getFeed } from '@rss/core/usecase';
import { createServerFn } from '@tanstack/solid-start';
import { DateTime, Effect, Schema } from 'effect';
import { AppRuntime } from './runtime';
import { getSession } from './auth-utils';

function serializeFeed(feed: any) {
  return {
    ...feed,
    createdAt: DateTime.toDate(feed.createdAt).toISOString(),
    data: {
      ...feed.data,
      link: typeof feed.data.link === 'object' ? (feed.data.link as URL).toString() : feed.data.link,
    },
  };
}

function serializeItem(item: any) {
  return {
    ...item,
    createdAt: DateTime.toDate(item.createdAt).toISOString(),
  };
}

async function ensureUserId() {
  const session = await getSession();

  if (!session) {
    throw new Error('Unauthorized');
  }

  return UserId.make(session.user.id);
}

export const createFeedFn = createServerFn({ method: 'POST' })
  .validator((input: unknown) => input)
  .handler(async ({ data }) => {
    const userId = await ensureUserId();
    const feedData = Schema.decodeUnknownSync(FeedData)(data);

    const feed = await AppRuntime.runPromise(createFeed({ data: feedData, userId }));

    return serializeFeed(feed);
  });

export const addItemFn = createServerFn({ method: 'POST' })
  .validator((input: unknown) => input)
  .handler(async ({ data }) => {
    const { feedId, itemData } = data as { feedId: FeedId; itemData: unknown };
    const decoded = Schema.decodeUnknownSync(ItemData)(itemData);

    const item = await AppRuntime.runPromise(addItem({ data: decoded, feedId }));

    return serializeItem(item);
  });

export const getFeedFn = createServerFn({ method: 'GET' })
  .validator((input: unknown) => input)
  .handler(async ({ data }) => {
    const { feedId } = data as { feedId: FeedId };

    const result = await AppRuntime.runPromise(getFeed(feedId));

    return { feed: serializeFeed(result.feed), items: result.items.map(serializeItem) };
  });

export const listUserFeedsFn = createServerFn({ method: 'GET' }).handler(async () => {
  const userId = await ensureUserId();

  const feeds = await AppRuntime.runPromise(
    Effect.gen(function* () {
      const feedRepo = yield* FeedRepository;

      return yield* feedRepo.findByUserId(userId);
    }),
  );

  return feeds.map(serializeFeed);
});
