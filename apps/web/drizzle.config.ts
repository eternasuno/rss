import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dbCredentials: {
    url: './data/rss.db',
  },
  dialect: 'sqlite',
  out: './drizzle',
  schema: './src/db/schema.ts',
});
