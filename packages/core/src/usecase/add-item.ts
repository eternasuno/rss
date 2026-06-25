import { DateTime, Effect, Option, Schema } from 'effect';
import { FeedId } from '../entity/feed.js';
import { type Item, ItemData, ItemId } from '../entity/item.js';
import { AppError } from '../port/app-error.js';
import { Crypto } from '../port/crypto.js';
import { FeedRepository } from '../port/feed-repository.js';
import { ItemRepository } from '../port/item-repository.js';

export const AddItemInput = Schema.Struct({
  data: ItemData,
  feedId: FeedId,
});

export type AddItemInput = typeof AddItemInput.Type;

export const addItem = (input: AddItemInput) =>
  Effect.gen(function* () {
    const crypto = yield* Crypto;
    const feedRepo = yield* FeedRepository;
    const itemRepo = yield* ItemRepository;

    const feed = yield* feedRepo.findById(input.feedId);
    if (Option.isNone(feed)) {
      return yield* new AppError({ code: 'NOT_FOUND', message: 'Feed not found' });
    }

    const itemId = ItemId.make(yield* crypto.generateUUId());
    const createdAt = yield* DateTime.now;
    const item: Item = {
      createdAt,
      data: input.data,
      feedId: input.feedId,
      id: itemId,
    };

    const saved = yield* itemRepo.create(item);
    return saved;
  });
