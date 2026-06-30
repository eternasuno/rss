import { drizzle } from 'drizzle-orm/tursodatabase/database';
import { relations } from './db/relations';

export const db = drizzle({
  connection: { path: process.env.DATABASE_URL || './.data/sqlite.db' },
  relations,
});

export { relations } from './db/relations';
export * as schema from './db/schema';
