import { createBetterAuthDb } from '@rss/infrastructure-sqlite/db';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

export const auth = betterAuth({
  baseURL: process.env['BETTER_AUTH_URL'] || 'http://localhost:5100',
  database: drizzleAdapter(createBetterAuthDb(), {
    provider: 'sqlite',
  }),
  emailAndPassword: {
    enabled: true,
  },
});
