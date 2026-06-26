import { createServerFn } from '@tanstack/solid-start';
import { Layer, ManagedRuntime } from 'effect';
import { getAuth } from './auth';

export const getSession = createServerFn({ method: 'GET' }).handler(async () => {
  const auth = await getAuth();
  const { getRequestHeaders } = await import('@tanstack/solid-start/server');

  return auth.api.getSession({
    headers: new Headers(getRequestHeaders()),
  });
});

export const checkHasUsers = createServerFn({ method: 'GET' }).handler(async () => {
  const { DB } = await import('@rss/infrastructure-sqlite/db');
  const { user } = await import('@rss/infrastructure-sqlite/schema');
  // @ts-expect-error - resolved at runtime via workspace dependency
  const { sql } = await import('drizzle-orm');

  const runtime = ManagedRuntime.make(
    Layer.mergeAll(DB.Default) as unknown as Layer.Layer<unknown, unknown, never>,
  );

  const db = await runtime.runPromise(DB);
  const result = await db.select({ count: sql<number>`count(*)` }).from(user);

  return Number(result[0].count) > 0;
});
