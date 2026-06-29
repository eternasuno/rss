import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.DB_FILE_NAME ?? './.data/sqlite.db',
  },
});
