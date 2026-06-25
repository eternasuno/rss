import * as path from 'node:path';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from './schema';

const getDefaultPath = (): string => {
  const envPath = process.env.DATABASE_URL;
  if (envPath === ':memory:') {
    return ':memory:';
  }
  if (envPath) {
    return envPath;
  }
  return path.join(process.cwd(), 'data', 'rss.db');
};

export const createClient = (dbPath?: string) => {
  const resolvedPath = dbPath ?? getDefaultPath();
  const sqlite = new Database(resolvedPath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  return drizzle({ client: sqlite, schema });
};

export const runMigrate = ({
  client,
  migrationsFolder,
}: {
  client: ReturnType<typeof createClient>;
  migrationsFolder: string;
}) => {
  migrate(client, { migrationsFolder });
};
