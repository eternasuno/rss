import type { Config } from 'drizzle-kit';

export default {
  dbCredentials: {
    url: process.env.DATABASE_URL ?? './data/db.sqlite',
  },
  dialect: 'sqlite',
  out: './drizzle',
  schema: './db/schema',
} satisfies Config;
