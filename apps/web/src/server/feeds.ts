import type { FeedData } from '@rss/core/entity';
import { FeedId, UserId } from '@rss/core/entity';
import { createFeed } from '@rss/core/usecase';
import { getFeed } from '@rss/core/usecase';
import { generateXML } from '@rss/core/usecase';
import { FeedRepository } from '@rss/core/port';
import { createServerFn } from '@tanstack/solid-start';
import { DateTime, Effect } from 'effect';
import { AppRuntime } from '../lib/effect-runtime';
import { writeFeedFile } from '../lib/feed-gen';
import { getSession } from '../lib/auth-utils';

// --- Serialization helpers ---

const formatDate = (utc: DateTime.Utc): string =>
  DateTime.toDate(utc).toISOString();

const serializeFeed = (feed: import('@rss/core/entity').Feed) => {
  const { description, link, title, ...extraData } = feed.data;

  return {
    createdAt: formatDate(feed.createdAt),
    data: extraData,
    description,
    id: feed.id,
    link: link.toString(),
    title,
    userId: feed.userId,
  };
};

const serializeItem = (item: import('@rss/core/entity').Item) => {
  const { title, ...extraData } = item.data;

  return {
    createdAt: formatDate(item.createdAt),
    data: extraData,
    feedId: item.feedId,
    id: item.id,
    title,
  };
};

// --- Server Functions ---

export const createFeedFn = createServerFn({ method: 'POST' })
  .validator((d: {
    title: string;
    description: string;
    link: string;
    data?: Record<string, unknown>;
  }) => d)
  .handler(async ({ data: input }) => {
    const session = await getSession();
    if (!session?.user) throw new Error('Unauthorized');

    const result = await AppRuntime.runPromise(
      createFeed({
        data: {
          description: input.description,
          link: new URL(input.link),
          title: input.title,
          ...(input.data ?? {}),
        } as FeedData,
        userId: UserId.make(session.user.id),
      })
    );

    return { data: { feed: serializeFeed(result) }, success: true };
  });

export const listFeedsFn = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await getSession();
  if (!session?.user) throw new Error('Unauthorized');

  const feeds = await AppRuntime.runPromise(
    Effect.flatMap(FeedRepository, (repo) => repo.findByUserId(UserId.make(session.user.id)))
  );

  return feeds.map(serializeFeed);
});

export const getFeedDetailFn = createServerFn({ method: 'GET' })
  .validator((d: { id: string }) => d)
  .handler(async ({ data: { id } }) => {
    const session = await getSession();
    if (!session?.user) throw new Error('Unauthorized');

    const feedId = FeedId.make(id);

    const { feed, items } = await AppRuntime.runPromise(getFeed(feedId));

    if (feed.userId !== session.user.id) return null;

    // API keys are now managed via better-auth — return user info instead
    return {
      apiKey: null,
      feed: serializeFeed(feed),
      items: items.map(serializeItem),
    };
  });

export const regenerateXmlFn = createServerFn({ method: 'POST' })
  .validator((d: { feedId: string }) => d)
  .handler(async ({ data: { feedId } }) => {
    const session = await getSession();
    if (!session?.user) throw new Error('Unauthorized');

    const feedIdBranded = FeedId.make(feedId);

    const { feed } = await AppRuntime.runPromise(getFeed(feedIdBranded));

    if (feed.userId !== session.user.id) throw new Error('Not found');

    const xml = await AppRuntime.runPromise(generateXML(feedIdBranded));
    writeFeedFile({ feedId, xml });

    return { success: true };
  });
