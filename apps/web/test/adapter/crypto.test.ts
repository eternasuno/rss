import { assert, it } from '@effect/vitest';
import { Effect } from 'effect';
import { CryptoLive } from '../../src/adapter/crypto';
import { Crypto } from '../../src/core/port';

it.effect('Crypto: generates a UUID string', () =>
  Effect.gen(function* () {
    const crypto = yield* Crypto;
    const uuid = yield* crypto.generateUUId();

    assert.ok(typeof uuid === 'string');
    assert.ok(uuid.length > 0);
  }).pipe(Effect.provide(CryptoLive))
);

it.effect('Crypto: generates unique UUIDs', () =>
  Effect.gen(function* () {
    const crypto = yield* Crypto;
    const a = yield* crypto.generateUUId();
    const b = yield* crypto.generateUUId();

    assert.notStrictEqual(a, b);
  }).pipe(Effect.provide(CryptoLive))
);
