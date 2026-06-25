import { assert, it } from '@effect/vitest';
import { FeedId, type Item, ItemId } from '@rss/core/entity';
import { createClient } from '@rss/infrastructure-sqlite/db';
import { sql } from 'drizzle-orm';
import { DateTime, Effect, Option } from 'effect';
import { createItemRepository } from '../src/item-repository';

const setupDb = () => {
  const db = createClient(':memory:');
  db.run(
    sql.raw(`CREATE TABLE feeds (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL,
    title TEXT NOT NULL, description TEXT NOT NULL, link TEXT NOT NULL,
    data TEXT DEFAULT '{}', created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`)
  );
  db.run(
    sql.raw(`CREATE TABLE items (
    id TEXT PRIMARY KEY, feed_id TEXT NOT NULL,
    title TEXT NOT NULL, data TEXT DEFAULT '{}', created_at TEXT NOT NULL)`)
  );
  db.run(
    sql.raw(`INSERT INTO feeds (id, user_id, title, description, link, data, created_at, updated_at)
    VALUES ('feed-1', 'user-1', 'Feed', 'Desc', 'https://example.com', '{}', '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z')`)
  );
  return db;
};

const sampleItem: Item = {
  createdAt: DateTime.unsafeMake(0),
  data: { title: 'Test Item' } as Item['data'],
  feedId: FeedId.make('feed-1'),
  id: ItemId.make('item-1'),
};

it.effect('ItemRepository: creates and finds an item by id', () =>
  Effect.gen(function* () {
    const db = setupDb();
    const repo = createItemRepository(db);
    yield* repo.create(sampleItem);
    const found = yield* repo.findById(sampleItem.id);
    assert.ok(Option.isSome(found));
    if (Option.isSome(found)) {
      assert.strictEqual(found.value.data.title, sampleItem.data.title);
    }
  })
);

it.effect('ItemRepository: finds items by feed id', () =>
  Effect.gen(function* () {
    const db = setupDb();
    const repo = createItemRepository(db);
    yield* repo.create(sampleItem);
    const results = yield* repo.findByFeedId(sampleItem.feedId);
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].id, sampleItem.id);
  })
);

it.effect('ItemRepository: deletes an item', () =>
  Effect.gen(function* () {
    const db = setupDb();
    const repo = createItemRepository(db);
    yield* repo.create(sampleItem);
    yield* repo.delete([sampleItem.id]);
    const found = yield* repo.findById(sampleItem.id);
    assert.ok(Option.isNone(found));
  })
);

it.effect('ItemRepository: returns none for missing item', () =>
  Effect.gen(function* () {
    const db = setupDb();
    const repo = createItemRepository(db);
    const found = yield* repo.findById(ItemId.make('nonexistent'));
    assert.ok(Option.isNone(found));
  })
);
