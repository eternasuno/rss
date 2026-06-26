import { apiKey } from '@better-auth/api-key';
import { DB } from '@rss/infrastructure-sqlite/db';
import * as schema from '@rss/infrastructure-sqlite/schema';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { tanstackStartCookies } from 'better-auth/tanstack-start/solid';
import { Layer, ManagedRuntime } from 'effect';

const dbLayer = Layer.mergeAll(DB.Default) as unknown as Layer.Layer<unknown, unknown, never>;

const dbRuntime = ManagedRuntime.make(dbLayer);

async function getDb() {
  return dbRuntime.runPromise(DB);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _auth: any = null;

export async function getAuth() {
  if (_auth) {
    return _auth;
  }

  const db = await getDb();

  _auth = betterAuth({
    database: drizzleAdapter(db, { provider: 'sqlite', schema }),
    emailAndPassword: { enabled: true },
    plugins: [apiKey(), tanstackStartCookies()],
  });

  return _auth;
}
