import { assert, it } from '@effect/vitest';
import { Effect, Layer } from 'effect';
import { FeedId } from '../../src/entity/feed.js';
import { getFeedDetail } from '../../src/usecase/get-feed-detail.js';
import { FeedRepositoryEmpty, FeedRepositoryTest } from '../mock/feed-repository.js';
import { ItemRepositoryTest } from '../mock/item-repository.js';

it.effect('getFeedDetail: should return feed detail with items when feed exists', () =>
  Effect.gen(function* () {
    const result = yield* getFeedDetail(FeedId.make('feed-0001'));

    assert.strictEqual(result.feed.data.title, 'Test Feed');
    assert.strictEqual(result.items.length, 1);
    assert.strictEqual(result.items[0].data.title, 'Test Item Title');
  }).pipe(Effect.provide(Layer.mergeAll(FeedRepositoryTest, ItemRepositoryTest)))
);

it.effect('getFeedDetail: should return NOT_FOUND when feed does not exist', () =>
  Effect.gen(function* () {
    const error = yield* getFeedDetail(FeedId.make('nonexistent')).pipe(Effect.flip);

    assert.strictEqual(error.code, 'NOT_FOUND');
  }).pipe(Effect.provide(Layer.mergeAll(FeedRepositoryEmpty, ItemRepositoryTest)))
);
