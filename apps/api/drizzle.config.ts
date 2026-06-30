import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dbCredentials: {
    url: process.env.DATABASE_URL ?? './.data/sqlite.db',
  },
  dialect: 'turso',
  out: './drizzle',
  schema: './src/db/schema',
});
