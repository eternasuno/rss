import { apiKeyClient } from '@better-auth/api-key/client';
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:5100',
  plugins: [apiKeyClient()],
});

export const { signIn, signUp, useSession, signOut } = authClient;
