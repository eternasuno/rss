import { assert, it } from '@effect/vitest';
import { Effect, Layer } from 'effect';
import { FeedId } from '../../src/entity/feed.js';
import { addItem } from '../../src/usecase/add-item.js';
import { CryptoTest } from '../mock/crypto.js';
import { TEST_UUID } from '../mock/data/crypto.js';
import { sampleItemData } from '../mock/data/item.js';
import { FeedRepositoryEmpty, FeedRepositoryTest } from '../mock/feed-repository.js';
import { ItemRepositoryEmpty, ItemRepositoryTest } from '../mock/item-repository.js';

it.effect('addItem: should create an item under an existing feed', () =>
  Effect.gen(function* () {
    const item = yield* addItem({
      data: sampleItemData,
      feedId: FeedId.make('feed-0001'),
    });

    assert.strictEqual(item.data.title, 'Test Item Title');
    assert.strictEqual(item.id, TEST_UUID);
  }).pipe(Effect.provide(Layer.mergeAll(CryptoTest, FeedRepositoryTest, ItemRepositoryTest)))
);

it.effect('addItem: should return NOT_FOUND when feed does not exist', () =>
  Effect.gen(function* () {
    const error = yield* addItem({
      data: sampleItemData,
      feedId: FeedId.make('nonexistent'),
    }).pipe(Effect.flip);

    assert.strictEqual(error.code, 'NOT_FOUND');
  }).pipe(Effect.provide(Layer.mergeAll(CryptoTest, FeedRepositoryEmpty, ItemRepositoryEmpty)))
);
