import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import * as path from 'node:path';
import * as schema from './schema';

const getDbPath = () => {
  const envPath = process.env.DATABASE_URL;
  if (envPath === ':memory:') return ':memory:';
  if (envPath) return envPath;
  return path.join(process.cwd(), 'data', 'rss.db');
};

const sqlite = new Database(getDbPath());
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle({ client: sqlite, schema });

export const runMigrate = ({ migrationsFolder }: { migrationsFolder: string }) => {
  migrate(db, { migrationsFolder });
};
