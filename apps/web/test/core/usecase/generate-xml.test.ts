import { assert, it } from '@effect/vitest';
import { Effect, Layer } from 'effect';
import { FeedId } from '../../../src/core/entity/feed';
import { generateXML } from '../../../src/core/usecase/generate-xml';
import { FeedGeneratorTest } from '../mock/feed-generator';
import { FeedRepositoryEmpty, FeedRepositoryTest } from '../mock/feed-repository';
import { ItemRepositoryTest } from '../mock/item-repository';

const XML_OUTPUT =
  '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Test</title></channel></rss>';

it.effect('generateXML: should return generated XML when feed exists', () =>
  Effect.gen(function* () {
    const xml = yield* generateXML(FeedId.make('feed-0001'));

    assert.strictEqual(xml, XML_OUTPUT);
  }).pipe(
    Effect.provide(Layer.mergeAll(FeedRepositoryTest, ItemRepositoryTest, FeedGeneratorTest))
  )
);

it.effect('generateXML: should return NOT_FOUND when feed does not exist', () =>
  Effect.gen(function* () {
    const error = yield* generateXML(FeedId.make('nonexistent')).pipe(Effect.flip);

    assert.strictEqual(error.code, 'NOT_FOUND');
  }).pipe(
    Effect.provide(Layer.mergeAll(FeedRepositoryEmpty, ItemRepositoryTest, FeedGeneratorTest))
  )
);
