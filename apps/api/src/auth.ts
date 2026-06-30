import { apiKey } from '@better-auth/api-key';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import { db, schema } from './db';

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'sqlite', schema }),
  emailAndPassword: { enabled: true },
  plugins: [
    apiKey({
      keyExpiration: {
        defaultExpiresIn: 90 * 24 * 60 * 60, // 90 days in seconds
      },
      rateLimit: {
        enabled: false,
      },
    }),
  ],
});
