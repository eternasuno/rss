'use server';

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

export async function listApiKeys(): Promise<
  | { error: 'Unauthorized'; keys: null }
  | {
      error: null;
      keys: Array<{
        id: string;
        name: string | null;
        start: string | null;
        prefix: string | null;
        createdAt: string;
      }>;
    }
> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: 'Unauthorized' as const, keys: null };
  }

  const result = await auth.api.listApiKeys({
    headers: await headers(),
    query: { limit: 10 },
  });

  return {
    error: null,
    keys: result.apiKeys.map((key) => ({
      createdAt: key.createdAt.toISOString(),
      id: key.id,
      name: key.name,
      prefix: key.prefix,
      start: key.start,
    })),
  };
}

export async function createApiKey(name?: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: 'Unauthorized' as const, key: null };
  }

  const existing = await auth.api.listApiKeys({
    headers: await headers(),
    query: { limit: 1 },
  });

  if (existing.apiKeys.length > 0) {
    return { error: 'You already have an API key' as const, key: null };
  }

  const result = await auth.api.createApiKey({
    body: {
      name: name ?? 'Default',
      permissions: { items: ['create'] },
      userId: session.user.id,
    },
    headers: await headers(),
  });

  return { error: null, key: result };
}

export async function deleteApiKey(keyId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: 'Unauthorized' as const, success: false };
  }

  await auth.api.deleteApiKey({
    body: { keyId },
    headers: await headers(),
  });

  return { error: null, success: true };
}
