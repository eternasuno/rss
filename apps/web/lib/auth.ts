import { apiKey } from '@better-auth/api-key';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { betterAuth } from 'better-auth';
import { db } from '@/db';
import * as schema from '@/db/schema';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    apiKey({
      defaultPrefix: 'rss_',
      enableMetadata: false,
      enableSessionForAPIKeys: true,
      rateLimit: {
        enabled: true,
        maxRequests: 100,
        timeWindow: 60 * 60 * 1000,
      },
    }),
  ],
});
