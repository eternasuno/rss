import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dbCredentials: {
    url: process.env.DATABASE_URL ?? './data/rss.db',
  },
  dialect: 'sqlite',
  out: './drizzle',
  schema: '../../packages/infrastructure-sqlite/src/schema.ts',
});
