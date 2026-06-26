import { assert, it } from '@effect/vitest';
import type { FeedData, FeedId, UserId } from '@rss/core/entity';
import { FeedRepository } from '@rss/core/port';
import { DB } from '@rss/infrastructure-sqlite/db';
import { Effect, Function as Fn, Layer, Option } from 'effect';
import { FeedRepositoryLive } from '../src/feed-repository';
import { mockConfigProvider } from './mock/config';
import { makeFeed } from './mock/feed';
import { createTables } from './mock/tables';

const provideTestLayers = Fn.flow(
  Effect.provide(Layer.provideMerge(FeedRepositoryLive, DB.Default)),
  Effect.withConfigProvider(mockConfigProvider)
);

it.effect('FeedRepository: creates and returns a feed', () =>
  Effect.gen(function* () {
    yield* createTables;

    const repo = yield* FeedRepository;
    const feed = makeFeed();

    const created = yield* repo.create(feed);

    assert.strictEqual(created, feed);
  }).pipe(provideTestLayers)
);

it.effect('FeedRepository: finds a feed by id', () =>
  Effect.gen(function* () {
    yield* createTables;

    const repo = yield* FeedRepository;
    const feed = makeFeed();
    yield* repo.create(feed);

    const found = yield* repo.findById(feed.id);

    assert.isTrue(Option.isSome(found));
    if (Option.isSome(found)) {
      assert.strictEqual(found.value.id, feed.id);
      assert.strictEqual(found.value.data.title, feed.data.title);
      assert.strictEqual(found.value.data.description, feed.data.description);
      assert.strictEqual(found.value.data.link.toString(), feed.data.link.toString());
      assert.strictEqual(found.value.userId, feed.userId);
    }
  }).pipe(provideTestLayers)
);

it.effect('FeedRepository: returns None for non-existent feed', () =>
  Effect.gen(function* () {
    yield* createTables;

    const repo = yield* FeedRepository;

    const result = yield* repo.findById('non-existent' as FeedId);

    assert.isTrue(Option.isNone(result));
  }).pipe(provideTestLayers)
);

it.effect('FeedRepository: finds feeds by user id', () =>
  Effect.gen(function* () {
    yield* createTables;

    const repo = yield* FeedRepository;
    const feed1 = makeFeed({ id: 'feed-1' as FeedId, userId: 'user-a' as UserId });
    const feed2 = makeFeed({ id: 'feed-2' as FeedId, userId: 'user-a' as UserId });
    const feed3 = makeFeed({ id: 'feed-3' as FeedId, userId: 'user-b' as UserId });
    yield* repo.create(feed1);
    yield* repo.create(feed2);
    yield* repo.create(feed3);

    const userAFeeds = yield* repo.findByUserId('user-a' as UserId);
    assert.strictEqual(userAFeeds.length, 2);

    const userBFeeds = yield* repo.findByUserId('user-b' as UserId);
    assert.strictEqual(userBFeeds.length, 1);
  }).pipe(provideTestLayers)
);

it.effect('FeedRepository: updates feed fields', () =>
  Effect.gen(function* () {
    yield* createTables;

    const repo = yield* FeedRepository;
    const feed = makeFeed();
    yield* repo.create(feed);

    yield* repo.update(feed.id)({
      description: 'Updated description',
      link: new URL('https://updated.example.com'),
      title: 'Updated Title',
    } as Partial<FeedData>);

    const found = yield* repo.findById(feed.id);
    assert.isTrue(Option.isSome(found));
    if (Option.isSome(found)) {
      assert.strictEqual(found.value.data.title, 'Updated Title');
      assert.strictEqual(found.value.data.description, 'Updated description');
      assert.strictEqual(found.value.data.link.toString(), 'https://updated.example.com/');
    }
  }).pipe(provideTestLayers)
);

it.effect('FeedRepository: deletes feeds by ids', () =>
  Effect.gen(function* () {
    yield* createTables;

    const repo = yield* FeedRepository;
    const feed1 = makeFeed({ id: 'feed-1' as FeedId });
    const feed2 = makeFeed({ id: 'feed-2' as FeedId });
    yield* repo.create(feed1);
    yield* repo.create(feed2);

    yield* repo.delete([feed1.id]);
    const result1 = yield* repo.findById(feed1.id);
    assert.isTrue(Option.isNone(result1));

    const result2 = yield* repo.findById(feed2.id);
    assert.isTrue(Option.isSome(result2));
  }).pipe(provideTestLayers)
);

it.effect('FeedRepository: preserves extra data on round-trip', () =>
  Effect.gen(function* () {
    yield* createTables;

    const repo = yield* FeedRepository;
    const feed = makeFeed({
      data: {
        description: 'With extra',
        'itunes.author': 'Test Author',
        'itunes.duration': '00:30:00',
        link: new URL('https://example.com'),
        title: 'Extra Feed',
      } as unknown as FeedData,
    });
    yield* repo.create(feed);

    const found = yield* repo.findById(feed.id);

    assert.isTrue(Option.isSome(found));
    if (Option.isSome(found)) {
      assert.strictEqual(found.value.data['itunes.author'], 'Test Author');
      assert.strictEqual(found.value.data['itunes.duration'], '00:30:00');
      assert.strictEqual(found.value.data.title, 'Extra Feed');
    }
  }).pipe(provideTestLayers)
);
