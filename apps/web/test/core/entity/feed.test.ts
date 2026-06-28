import { assert, it } from '@effect/vitest';
import { Effect, Exit, Schema } from 'effect';
import { FeedData } from '../../../src/core/entity/feed';

it.effect('FeedData: should decode valid feed data with all required fields', () =>
  Effect.gen(function* () {
    const result = yield* Schema.decodeUnknown(FeedData)({
      description: 'Test description',
      link: 'https://example.com',
      title: 'My Feed',
    });

    assert.strictEqual(result.title, 'My Feed');
    assert.strictEqual(result.description, 'Test description');
    assert.ok(result.link instanceof URL);
  })
);

it.effect('FeedData: should reject whitespace-only title', () =>
  Effect.gen(function* () {
    const result = yield* Schema.decodeUnknown(FeedData)({
      description: 'Test',
      link: 'https://example.com',
      title: '   ',
    }).pipe(Effect.exit);

    assert.ok(Exit.isFailure(result));
  })
);

it.effect('FeedData: should reject invalid URL in link', () =>
  Effect.gen(function* () {
    const result = yield* Schema.decodeUnknown(FeedData)({
      description: 'Test',
      link: 'not-a-valid-url',
      title: 'My Feed',
    }).pipe(Effect.exit);

    assert.ok(Exit.isFailure(result));
  })
);
