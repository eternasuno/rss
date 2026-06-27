import { assert, it } from '@effect/vitest';
import type { Feed, FeedData, FeedId, Item, ItemId, UserId } from '@rss/core/entity';
import { FeedGenerator } from '@rss/core/port';
import { DateTime, Effect } from 'effect';
import { FeedGeneratorLive } from '../src/feed-generator';

const feed: Feed = {
  createdAt: DateTime.unsafeNow(),
  data: {
    description: 'A test feed',
    link: new URL('https://example.com'),
    title: 'Test Feed',
  } as FeedData,
  id: 'test-feed-id' as FeedId,
  userId: 'test-user-id' as UserId,
};

const item: Item = {
  createdAt: DateTime.unsafeNow(),
  data: {
    title: 'Test Item' as never,
  },
  feedId: 'test-feed-id' as FeedId,
  id: 'test-item-id' as ItemId,
};

it.effect('FeedsmithGenerator: generates valid RSS XML with items', () =>
  Effect.gen(function* () {
    const generator = yield* FeedGenerator;
    const xml = yield* generator.generateFeedXml({ feed, items: [item] });

    assert.ok(xml.includes('<rss'));
    assert.ok(xml.includes('<channel>'));
    assert.ok(xml.includes('<title>Test Feed</title>'));
    assert.ok(xml.includes('<item>'));
    assert.ok(xml.includes('<title>Test Item</title>'));
  }).pipe(Effect.provide(FeedGeneratorLive))
);

it.effect('FeedsmithGenerator: generates RSS XML with no items', () =>
  Effect.gen(function* () {
    const generator = yield* FeedGenerator;
    const xml = yield* generator.generateFeedXml({ feed, items: [] });

    assert.ok(xml.includes('<channel>'));
    assert.ok(xml.includes('<title>Test Feed</title>'));
  }).pipe(Effect.provide(FeedGeneratorLive))
);
