import { assert, it } from '@effect/vitest';
import { Effect, Exit, Schema } from 'effect';
import { ItemData } from '../../../src/core/entity/item';

it.effect('ItemData: should decode valid item data with title only', () =>
  Effect.gen(function* () {
    const result = yield* Schema.decodeUnknown(ItemData)({
      title: 'Test Item',
    });

    assert.strictEqual(result.title, 'Test Item');
  })
);

it.effect('ItemData: should decode valid item data with extra fields', () =>
  Effect.gen(function* () {
    const result = yield* Schema.decodeUnknown(ItemData)({
      description: 'Extra description',
      title: 'Rich Item',
    });

    assert.strictEqual(result.title, 'Rich Item');
    assert.strictEqual(result.description, 'Extra description');
  })
);

it.effect('ItemData: should reject empty title', () =>
  Effect.gen(function* () {
    const result = yield* Schema.decodeUnknown(ItemData)({
      title: '',
    }).pipe(Effect.exit);

    assert.ok(Exit.isFailure(result));
  })
);
