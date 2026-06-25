import { assert, it } from '@effect/vitest';
import { type Feed, FeedId, UserId } from '@rss/core/entity';
import { createClient } from '@rss/infrastructure-sqlite/db';
import { sql } from 'drizzle-orm';
import { DateTime, Effect, Option } from 'effect';
import { createFeedRepository } from '../src/feed-repository';

const setupDb = () => {
  const db = createClient(':memory:');
  db.run(
    sql.raw(`CREATE TABLE users (
    id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL, created_at TEXT NOT NULL)`)
  );
  db.run(
    sql.raw(`CREATE TABLE feeds (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id),
    title TEXT NOT NULL, description TEXT NOT NULL, link TEXT NOT NULL,
    data TEXT DEFAULT '{}', created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`)
  );
  db.run(
    sql.raw(`INSERT INTO users (id, email, password_hash, created_at)
    VALUES ('user-1', 'test@test.com', 'hash', '2024-01-01T00:00:00.000Z')`)
  );
  return db;
};

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
    const db = setupDb();
    const repo = createFeedRepository(db);
    yield* repo.create(sampleFeed);
    const found = yield* repo.findById(sampleFeed.id);
    assert.ok(Option.isSome(found));
    if (Option.isSome(found)) {
      assert.strictEqual(found.value.data.title, sampleFeed.data.title);
    }
  })
);

it.effect('FeedRepository: finds feeds by user id', () =>
  Effect.gen(function* () {
    const db = setupDb();
    const repo = createFeedRepository(db);
    yield* repo.create(sampleFeed);
    const results = yield* repo.findByUserId(sampleFeed.userId);
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].id, sampleFeed.id);
  })
);

it.effect('FeedRepository: updates a feed', () =>
  Effect.gen(function* () {
    const db = setupDb();
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
  })
);

it.effect('FeedRepository: deletes a feed', () =>
  Effect.gen(function* () {
    const db = setupDb();
    const repo = createFeedRepository(db);
    yield* repo.create(sampleFeed);
    yield* repo.delete([sampleFeed.id]);
    const found = yield* repo.findById(sampleFeed.id);
    assert.ok(Option.isNone(found));
  })
);

it.effect('FeedRepository: returns none for missing feed', () =>
  Effect.gen(function* () {
    const db = setupDb();
    const repo = createFeedRepository(db);
    const found = yield* repo.findById(FeedId.make('nonexistent'));
    assert.ok(Option.isNone(found));
  })
);
