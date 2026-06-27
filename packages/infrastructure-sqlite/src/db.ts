import path from 'node:path';
import * as SqliteDrizzle from '@effect/sql-drizzle/Sqlite';
import { SqliteClient } from '@effect/sql-sqlite-node';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { Config, Effect } from 'effect';
import * as schema from './schema';

export const defaultDatabaseURL = path.join(process.cwd(), 'data', 'db.sqlite');

export class DB extends Effect.Service<DB>()('DB', {
  dependencies: [
    SqliteClient.layerConfig({
      filename: Config.string('DATABASE_URL').pipe(Config.withDefault(defaultDatabaseURL)),
    }),
  ],
  effect: SqliteDrizzle.make({ schema }),
}) {}

export * as Schema from './schema';

let _baDb: ReturnType<typeof drizzle> | undefined;

export const createBetterAuthDb = () => {
  if (!_baDb) {
    const url = process.env.DATABASE_URL ?? defaultDatabaseURL;
    _baDb = drizzle(new Database(url), { schema });
  }

  return _baDb;
};
