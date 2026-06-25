import * as SqliteDrizzle from '@effect/sql-drizzle/Sqlite';
import { SqliteClient } from '@effect/sql-sqlite-node';
import type { SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy';
import { Config, Effect, Layer } from 'effect';
import type { ConfigError } from 'effect/ConfigError';
import * as schema from './schema';

const filenameConfig = Config.string('DATABASE_URL').pipe(Config.withDefault('./data/rss.db'));

const SqlLive = SqliteClient.layerConfig({
  filename: filenameConfig,
});

const makeDrizzleLayer = (client: ReturnType<typeof SqliteClient.layer>) =>
  Layer.scoped(
    SqliteDrizzle.SqliteDrizzle,
    SqliteDrizzle.make({ schema }) as unknown as Effect.Effect<SqliteRemoteDatabase>
  ).pipe(Layer.provideMerge(client));

export const DrizzleLayer = makeDrizzleLayer(
  SqlLive
) as unknown as Layer.Layer<SqliteDrizzle.SqliteDrizzle>;

export const createClient: Effect.Effect<SqliteRemoteDatabase, ConfigError> = Effect.map(
  SqliteDrizzle.SqliteDrizzle,
  (db) => db
).pipe(Effect.provide(DrizzleLayer));

export const createTestClient: Effect.Effect<SqliteRemoteDatabase, ConfigError> = Effect.map(
  SqliteDrizzle.SqliteDrizzle,
  (db) => db
).pipe(Effect.provide(makeDrizzleLayer(SqliteClient.layer({ filename: ':memory:' }))));
