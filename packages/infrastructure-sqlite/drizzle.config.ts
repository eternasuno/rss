import { defineConfig } from 'drizzle-kit';
import { defaultDatabaseURL } from './src/db';

export default defineConfig({
  dbCredentials: {
    url: process.env.DATABASE_URL ?? defaultDatabaseURL,
  },
  dialect: 'sqlite',
  out: './drizzle',
  schema: './src/schema.ts',
});
