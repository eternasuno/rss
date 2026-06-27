import { assert, it } from '@effect/vitest';
import { Effect, Exit, Schema } from 'effect';
import { ExtraData, UserId } from '../../src/entity/value-object';

it.effect('ExtraData: should decode object with various JSON value types', () =>
  Effect.gen(function* () {
    const result = yield* Schema.decodeUnknown(ExtraData)({
      bool: true,
      num: 42,
      str: 'hello',
    });

    assert.strictEqual(result.bool, true);
    assert.strictEqual(result.num, 42);
    assert.strictEqual(result.str, 'hello');
  })
);

it.effect('ExtraData: should reject non-JSON values', () =>
  Effect.gen(function* () {
    const result = yield* Schema.decodeUnknown(ExtraData)({
      fn: () => 1,
    }).pipe(Effect.exit);

    assert.ok(Exit.isFailure(result));
  })
);

it.effect('UserId: should accept a valid branded UserId', () =>
  Effect.gen(function* () {
    const result = yield* Schema.decodeUnknown(UserId)('user-123');

    assert.strictEqual(result, 'user-123');
  })
);
