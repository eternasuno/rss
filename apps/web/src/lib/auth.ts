import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { tanstackStartCookies } from 'better-auth/tanstack-start/solid';
import { apiKey as apiKeyPlugin } from '@better-auth/api-key';
import { db, user, session, account, verification, apiKey as apiKeyTable } from './db';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: { user, session, account, verification, apiKey: apiKeyTable },
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: false,
  },
  plugins: [apiKeyPlugin(), tanstackStartCookies()],
});
