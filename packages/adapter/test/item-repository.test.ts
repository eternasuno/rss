import { assert, it } from '@effect/vitest';
import type { FeedId, ItemData, ItemId } from '@rss/core/entity';
import { ItemRepository } from '@rss/core/port';
import { DB } from '@rss/infrastructure-sqlite/db';
import { Effect, Layer, Option } from 'effect';
import { ItemRepositoryLive } from '../src/item-repository';
import { mockConfigProvider } from './mock/config';
import { makeItem } from './mock/item';
import { createTables } from './mock/tables';

const provideTestLayers = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  effect.pipe(
    Effect.provide(ItemRepositoryLive.pipe(Layer.provideMerge(DB.Default))),
    Effect.withConfigProvider(mockConfigProvider)
  );

it.effect('ItemRepository: creates and returns an item', () =>
  Effect.gen(function* () {
    yield* createTables;

    const repo = yield* ItemRepository;
    const item = makeItem();

    const created = yield* repo.create(item);

    assert.strictEqual(created, item);
  }).pipe(provideTestLayers)
);

it.effect('ItemRepository: finds an item by id', () =>
  Effect.gen(function* () {
    yield* createTables;

    const repo = yield* ItemRepository;
    const item = makeItem();
    yield* repo.create(item);

    const found = yield* repo.findById(item.id);

    assert.isTrue(Option.isSome(found));
    if (Option.isSome(found)) {
      assert.strictEqual(found.value.id, item.id);
      assert.strictEqual(found.value.data.title, item.data.title);
      assert.strictEqual(found.value.feedId, item.feedId);
    }
  }).pipe(provideTestLayers)
);

it.effect('ItemRepository: returns None for non-existent item', () =>
  Effect.gen(function* () {
    yield* createTables;

    const repo = yield* ItemRepository;

    const result = yield* repo.findById('non-existent' as ItemId);

    assert.isTrue(Option.isNone(result));
  }).pipe(provideTestLayers)
);

it.effect('ItemRepository: finds items by feed id', () =>
  Effect.gen(function* () {
    yield* createTables;

    const repo = yield* ItemRepository;
    const item1 = makeItem({ feedId: 'feed-a' as FeedId, id: 'item-1' as ItemId });
    const item2 = makeItem({ feedId: 'feed-a' as FeedId, id: 'item-2' as ItemId });
    const item3 = makeItem({ feedId: 'feed-b' as FeedId, id: 'item-3' as ItemId });
    yield* repo.create(item1);
    yield* repo.create(item2);
    yield* repo.create(item3);

    const feedAItems = yield* repo.findByFeedId('feed-a' as FeedId);
    assert.strictEqual(feedAItems.length, 2);

    const feedBItems = yield* repo.findByFeedId('feed-b' as FeedId);
    assert.strictEqual(feedBItems.length, 1);
  }).pipe(provideTestLayers)
);

it.effect('ItemRepository: deletes items by ids', () =>
  Effect.gen(function* () {
    yield* createTables;

    const repo = yield* ItemRepository;
    const item1 = makeItem({ id: 'item-1' as ItemId });
    const item2 = makeItem({ id: 'item-2' as ItemId });
    yield* repo.create(item1);
    yield* repo.create(item2);

    yield* repo.delete([item1.id]);
    const result1 = yield* repo.findById(item1.id);
    assert.isTrue(Option.isNone(result1));

    const result2 = yield* repo.findById(item2.id);
    assert.isTrue(Option.isSome(result2));
  }).pipe(provideTestLayers)
);

it.effect('ItemRepository: preserves extra data on round-trip', () =>
  Effect.gen(function* () {
    yield* createTables;

    const repo = yield* ItemRepository;
    const item = makeItem({
      data: {
        categories: ['tech', 'podcast'],
        'media.duration': 120,
        title: 'Extra Item',
      } as ItemData,
    });
    yield* repo.create(item);

    const found = yield* repo.findById(item.id);

    assert.isTrue(Option.isSome(found));
    if (Option.isSome(found)) {
      assert.strictEqual(found.value.data['media.duration'], 120);
      assert.deepStrictEqual(found.value.data.categories, ['tech', 'podcast']);
      assert.strictEqual(found.value.data.title, 'Extra Item');
    }
  }).pipe(provideTestLayers)
);
