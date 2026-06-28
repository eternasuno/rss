import { assert, it } from '@effect/vitest';
import { Effect, Layer } from 'effect';
import { createFeed } from '../../../src/core/usecase/create-feed';
import { CryptoTest } from '../mock/crypto';
import { TEST_UUID } from '../mock/data/crypto';
import { sampleFeedData, sampleUserId } from '../mock/data/feed';
import { FeedRepositoryTest } from '../mock/feed-repository';

it.effect('createFeed: should create a feed with generated ID from crypto', () =>
  Effect.gen(function* () {
    const feed = yield* createFeed({
      data: sampleFeedData,
      userId: sampleUserId,
    });

    assert.strictEqual(feed.data.title, 'Test Feed');
    assert.strictEqual(feed.id, TEST_UUID);
  }).pipe(Effect.provide(Layer.mergeAll(CryptoTest, FeedRepositoryTest)))
);
