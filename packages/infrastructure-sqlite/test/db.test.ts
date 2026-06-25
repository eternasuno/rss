import { assert, it } from '@effect/vitest';
import { Effect } from 'effect';
import { createTestClient } from '../src/db';

it.effect('DB: creates in-memory client', () =>
  Effect.gen(function* () {
    const db = yield* createTestClient;

    assert.ok(db !== undefined);
  })
);
