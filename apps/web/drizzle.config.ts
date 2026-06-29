import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dbCredentials: {
    url: process.env.DB_FILE_NAME ?? './.data/sqlite.db',
  },
  dialect: 'turso',
  out: './drizzle',
  schema: './src/lib/db/schema',
});
