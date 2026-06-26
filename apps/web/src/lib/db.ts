import * as path from 'node:path';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { user, session, account, verification, apiKey } from '@rss/infrastructure-sqlite/schema';

export { user, session, account, verification, apiKey };

const getDbPath = () => {
  const envPath = process.env.DATABASE_URL;
  if (envPath === ':memory:') return ':memory:';
  if (envPath) return envPath;
  return path.join(process.cwd(), 'data', 'rss.db');
};

const sqlite = new Database(getDbPath());
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle({ client: sqlite, schema: { user, session, account, verification, apiKey } });
