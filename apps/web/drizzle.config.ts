import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dbCredentials: {
    url: process.env.DATABASE_URL ?? './data/rss.db',
  },
  dialect: 'sqlite',
  out: './drizzle',
  schema: './src/infrastructure/schema.ts',
});
