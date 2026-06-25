import { assert, it } from '@effect/vitest';
import { Effect, Layer } from 'effect';
import { FeedId } from '../../src/entity/feed.js';
import { getFeed } from '../../src/usecase/get-feed.js';
import { FeedRepositoryEmpty, FeedRepositoryTest } from '../mock/feed-repository.js';
import { ItemRepositoryTest } from '../mock/item-repository.js';

it.effect('getFeed: should return feed with items when feed exists', () =>
  Effect.gen(function* () {
    const result = yield* getFeed(FeedId.make('feed-0001'));

    assert.strictEqual(result.feed.data.title, 'Test Feed');
    assert.strictEqual(result.items.length, 1);
    assert.strictEqual(result.items[0].data.title, 'Test Item Title');
  }).pipe(Effect.provide(Layer.mergeAll(FeedRepositoryTest, ItemRepositoryTest)))
);

it.effect('getFeed: should return NOT_FOUND when feed does not exist', () =>
  Effect.gen(function* () {
    const error = yield* getFeed(FeedId.make('nonexistent')).pipe(Effect.flip);

    assert.strictEqual(error.code, 'NOT_FOUND');
  }).pipe(Effect.provide(Layer.mergeAll(FeedRepositoryEmpty, ItemRepositoryTest)))
);
