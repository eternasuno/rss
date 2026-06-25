import { SqlClient } from '@effect/sql';
import * as SqliteDrizzle from '@effect/sql-drizzle/Sqlite';
import { SqliteClient } from '@effect/sql-sqlite-node';
import { assert, it } from '@effect/vitest';
import { FeedId, type Item, ItemId } from '@rss/core/entity';
import * as schema from '@rss/infrastructure-sqlite/schema';
import type { SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy';
import { DateTime, Effect, Layer, Option } from 'effect';
import { createItemRepository } from '../src/item-repository';

const TestLayer = Layer.scoped(
  SqliteDrizzle.SqliteDrizzle,
  SqliteDrizzle.make({ schema }) as unknown as Effect.Effect<SqliteRemoteDatabase>
).pipe(
  Layer.provideMerge(SqliteClient.layer({ filename: ':memory:' }))
) as unknown as Layer.Layer<SqliteDrizzle.SqliteDrizzle | SqlClient.SqlClient>;

const sampleItem: Item = {
  createdAt: DateTime.unsafeMake(0),
  data: { title: 'Test Item' } as Item['data'],
  feedId: FeedId.make('feed-1'),
  id: ItemId.make('item-1'),
};

const setup = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  yield* sql`CREATE TABLE feeds (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, title TEXT NOT NULL, description TEXT NOT NULL, link TEXT NOT NULL, data TEXT DEFAULT '{}', created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`;
  yield* sql`CREATE TABLE items (id TEXT PRIMARY KEY, feed_id TEXT NOT NULL, title TEXT NOT NULL, data TEXT DEFAULT '{}', created_at TEXT NOT NULL)`;
  yield* sql`INSERT INTO feeds (id, user_id, title, description, link, data, created_at, updated_at) VALUES ('feed-1', 'user-1', 'Feed', 'Desc', 'https://example.com', '{}', '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z')`;
});

it.effect('ItemRepository: creates and finds an item by id', () =>
  Effect.gen(function* () {
    yield* setup;
    const db = yield* SqliteDrizzle.SqliteDrizzle;
    const repo = createItemRepository(db);
    yield* repo.create(sampleItem);
    const found = yield* repo.findById(sampleItem.id);
    assert.ok(Option.isSome(found));
    if (Option.isSome(found)) {
      assert.strictEqual(found.value.data.title, sampleItem.data.title);
    }
  }).pipe(Effect.provide(TestLayer))
);

it.effect('ItemRepository: finds items by feed id', () =>
  Effect.gen(function* () {
    yield* setup;
    const db = yield* SqliteDrizzle.SqliteDrizzle;
    const repo = createItemRepository(db);
    yield* repo.create(sampleItem);
    const results = yield* repo.findByFeedId(sampleItem.feedId);
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].id, sampleItem.id);
  }).pipe(Effect.provide(TestLayer))
);

it.effect('ItemRepository: deletes an item', () =>
  Effect.gen(function* () {
    yield* setup;
    const db = yield* SqliteDrizzle.SqliteDrizzle;
    const repo = createItemRepository(db);
    yield* repo.create(sampleItem);
    yield* repo.delete([sampleItem.id]);
    const found = yield* repo.findById(sampleItem.id);
    assert.ok(Option.isNone(found));
  }).pipe(Effect.provide(TestLayer))
);

it.effect('ItemRepository: returns none for missing item', () =>
  Effect.gen(function* () {
    yield* setup;
    const db = yield* SqliteDrizzle.SqliteDrizzle;
    const repo = createItemRepository(db);
    const found = yield* repo.findById(ItemId.make('nonexistent'));
    assert.ok(Option.isNone(found));
  }).pipe(Effect.provide(TestLayer))
);
