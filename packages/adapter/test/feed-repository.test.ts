import { SqlClient } from '@effect/sql';
import * as SqliteDrizzle from '@effect/sql-drizzle/Sqlite';
import { SqliteClient } from '@effect/sql-sqlite-node';
import { assert, it } from '@effect/vitest';
import { type Feed, FeedId, UserId } from '@rss/core/entity';
import * as schema from '@rss/infrastructure-sqlite/schema';
import type { SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy';
import { DateTime, Effect, Layer, Option } from 'effect';
import { createFeedRepository } from '../src/feed-repository';

const TestLayer = Layer.scoped(
  SqliteDrizzle.SqliteDrizzle,
  SqliteDrizzle.make({ schema }) as unknown as Effect.Effect<SqliteRemoteDatabase>
).pipe(
  Layer.provideMerge(SqliteClient.layer({ filename: ':memory:' }))
) as unknown as Layer.Layer<SqliteDrizzle.SqliteDrizzle | SqlClient.SqlClient>;

const sampleFeed: Feed = {
  createdAt: DateTime.unsafeMake(0),
  data: {
    description: 'Test Description',
    link: new URL('https://example.com'),
    title: 'Test Feed',
  } as Feed['data'],
  id: FeedId.make('feed-1'),
  userId: UserId.make('user-1'),
};

it.effect('FeedRepository: creates and finds a feed by id', () =>
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;
    yield* sql`CREATE TABLE feeds (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL,
      title TEXT NOT NULL, description TEXT NOT NULL, link TEXT NOT NULL,
      data TEXT DEFAULT '{}', created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`;

    const db = yield* SqliteDrizzle.SqliteDrizzle;
    const repo = createFeedRepository(db);

    yield* repo.create(sampleFeed);
    const found = yield* repo.findById(sampleFeed.id);

    assert.ok(Option.isSome(found));
    if (Option.isSome(found)) {
      assert.strictEqual(found.value.data.title, sampleFeed.data.title);
    }
  }).pipe(Effect.provide(TestLayer))
);

it.effect('FeedRepository: finds feeds by user id', () =>
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;
    yield* sql`CREATE TABLE feeds (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL,
      title TEXT NOT NULL, description TEXT NOT NULL, link TEXT NOT NULL,
      data TEXT DEFAULT '{}', created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`;

    const db = yield* SqliteDrizzle.SqliteDrizzle;
    const repo = createFeedRepository(db);

    yield* repo.create(sampleFeed);
    const results = yield* repo.findByUserId(sampleFeed.userId);

    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].id, sampleFeed.id);
  }).pipe(Effect.provide(TestLayer))
);

it.effect('FeedRepository: updates a feed', () =>
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;
    yield* sql`CREATE TABLE feeds (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL,
      title TEXT NOT NULL, description TEXT NOT NULL, link TEXT NOT NULL,
      data TEXT DEFAULT '{}', created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`;

    const db = yield* SqliteDrizzle.SqliteDrizzle;
    const repo = createFeedRepository(db);

    yield* repo.create(sampleFeed);
    yield* repo.update(sampleFeed.id)({
      title: 'Updated Title' as string as Feed['data']['title'],
    });

    const found = yield* repo.findById(sampleFeed.id);

    assert.ok(Option.isSome(found));
    if (Option.isSome(found)) {
      assert.strictEqual(found.value.data.title, 'Updated Title');
    }
  }).pipe(Effect.provide(TestLayer))
);

it.effect('FeedRepository: deletes a feed', () =>
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;
    yield* sql`CREATE TABLE feeds (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL,
      title TEXT NOT NULL, description TEXT NOT NULL, link TEXT NOT NULL,
      data TEXT DEFAULT '{}', created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`;

    const db = yield* SqliteDrizzle.SqliteDrizzle;
    const repo = createFeedRepository(db);

    yield* repo.create(sampleFeed);
    yield* repo.delete([sampleFeed.id]);
    const found = yield* repo.findById(sampleFeed.id);

    assert.ok(Option.isNone(found));
  }).pipe(Effect.provide(TestLayer))
);

it.effect('FeedRepository: returns none for missing feed', () =>
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;
    yield* sql`CREATE TABLE feeds (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL,
      title TEXT NOT NULL, description TEXT NOT NULL, link TEXT NOT NULL,
      data TEXT DEFAULT '{}', created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`;

    const db = yield* SqliteDrizzle.SqliteDrizzle;
    const repo = createFeedRepository(db);

    const found = yield* repo.findById(FeedId.make('nonexistent'));

    assert.ok(Option.isNone(found));
  }).pipe(Effect.provide(TestLayer))
);
