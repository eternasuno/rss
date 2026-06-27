import type { SqlError } from '@effect/sql';
import { DB } from '@rss/infrastructure-sqlite/db';
import { Effect } from 'effect';

export const createTables: Effect.Effect<void, SqlError.SqlError, DB> = Effect.gen(function* () {
  const db = yield* DB;

  yield* db.run(
    `CREATE TABLE IF NOT EXISTS feeds (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, title TEXT NOT NULL, description TEXT NOT NULL, link TEXT NOT NULL, data TEXT, created_at INTEGER NOT NULL)`
  );

  yield* db.run(`CREATE INDEX IF NOT EXISTS user_id_idx ON feeds(user_id)`);

  yield* db.run(
    `CREATE TABLE IF NOT EXISTS items (id TEXT PRIMARY KEY, feed_id TEXT NOT NULL, title TEXT NOT NULL, data TEXT, created_at INTEGER NOT NULL)`
  );

  yield* db.run(`CREATE INDEX IF NOT EXISTS feed_id_idx ON items(feed_id)`);
});
