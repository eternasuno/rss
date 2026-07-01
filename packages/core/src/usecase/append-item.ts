import { Effect, Schema } from 'effect';
import { FeedId } from '../entity/feed';
import { type Item, ItemData, ItemId } from '../entity/item';
import { AppError } from '../port/app-error';
import { Crypto } from '../port/crypto';
import { FeedRepository } from '../port/feed-repository';
import { ItemRepository } from '../port/item-repository';

export const AppendItemParams = Schema.Struct({
  data: ItemData,
  feedId: FeedId,
});

export type AppendItemParams = typeof AppendItemParams.Type;

export const appendItem = ({ feedId, data }: AppendItemParams) =>
  Effect.gen(function* () {
    const crypto = yield* Crypto;
    const feedRepo = yield* FeedRepository;
    const itemRepo = yield* ItemRepository;

    yield* feedRepo.findById(feedId).pipe(
      Effect.flatten,
      Effect.catchTag(
        'NoSuchElementException',
        () => new AppError({ code: 'NOT_FOUND', message: 'Feed not found' })
      )
    );

    const id = ItemId.make(yield* crypto.generateUUId);
    const item: Item = { data, feedId, id };

    return yield* itemRepo.create(item);
  });
