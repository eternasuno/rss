import { assert, it } from '@effect/vitest';
import { Effect } from 'effect';
import { createClient } from '../src/db';

it.effect('DB: creates client for in-memory database', () =>
  Effect.sync(() => {
    const db = createClient(':memory:');

    assert.ok(db !== undefined);
  })
);
