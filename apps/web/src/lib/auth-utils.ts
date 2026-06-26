import { createServerFn } from '@tanstack/solid-start';
import { getRequestHeaders } from '@tanstack/solid-start/server';
import { count } from 'drizzle-orm';
import { auth } from './auth';
import { db } from '../db';
import { user } from '../db/schema';

export const getSession = createServerFn({ method: 'GET' }).handler(async () => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });

  return session;
});

export const checkHasUsers = createServerFn({ method: 'GET' }).handler(async () => {
  const rows = await db.select({ count: count() }).from(user);

  return rows[0].count > 0;
});

/**
 * Verify an API key and return the owning user's ID.
 * Works around a TypeScript definition gap: better-auth's verifyApiKey
 * response type omits `userId` on the returned key object, but the field
 * is present at runtime.
 */
export const getUserIdFromApiKey = async (apiKey: string): Promise<string | null> => {
  const result = await auth.api.verifyApiKey({ body: { key: apiKey } });
  if (!result.valid || !result.key) return null;
  const key = result.key as unknown as { userId: string };
  return key.userId;
};

export type ApiKeyData = {
  id: string;
  name: string;
  createdAt: Date;
};

export const listApiKeysFn = createServerFn({ method: 'GET' }).handler(async () => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  if (!session?.user) throw new Error('Unauthorized');

  const result = await auth.api.listApiKeys({ headers });

  return (result.apiKeys ?? []) as unknown as ApiKeyData[];
});

export const createApiKeyFn = createServerFn({ method: 'POST' })
  .validator((d: { name: string }) => d)
  .handler(async ({ data: { name } }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });
    if (!session?.user) throw new Error('Unauthorized');

    return await auth.api.createApiKey({ headers, body: { name } });
  });

export const deleteApiKeyFn = createServerFn({ method: 'POST' })
  .validator((d: { keyId: string }) => d)
  .handler(async ({ data: { keyId } }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });
    if (!session?.user) throw new Error('Unauthorized');

    await auth.api.deleteApiKey({ headers, body: { keyId } });

    return { success: true };
  });
