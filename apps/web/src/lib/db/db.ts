import { drizzle } from 'drizzle-orm/tursodatabase/database';
import { relations } from './relations';

export const db = drizzle({
  connection: { path: process.env.DATABASE_URL || './.data/sqlite.db' },
  relations,
});
