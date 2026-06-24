import { DateTime, Effect, Option, Schema } from 'effect';
import { FeedId } from '../entity/feed.js';
import { type Item, ItemId } from '../entity/item.js';
import { ExtraData } from '../entity/value-object.js';
import { AppError } from '../port/app-error.js';
import { FeedRepository } from '../port/feed-repository.js';
import { ItemRepository } from '../port/item-repository.js';

export const AddItemInput = Schema.Struct({
  extraData: Schema.optionalWith(ExtraData, { default: () => ({}) }),
  feedId: FeedId,
  title: Schema.NonEmptyTrimmedString,
});

export type AddItemInput = typeof AddItemInput.Type;

const newItemId = () => Effect.sync(() => ItemId.make(crypto.randomUUID()));

export const addItem = (input: AddItemInput) =>
  Effect.gen(function* () {
    const feedRepo = yield* FeedRepository;
    const itemRepo = yield* ItemRepository;

    const feed = yield* feedRepo.findById(input.feedId);
    if (Option.isNone(feed)) {
      return yield* new AppError({ code: 'NOT_FOUND', message: 'Feed not found' });
    }

    const itemId = yield* newItemId();
    const nowUtc = yield* DateTime.now;
    const item: Item = {
      createdAt: new Date(nowUtc.epochMillis),
      extraData: input.extraData,
      feedId: input.feedId,
      id: itemId,
      title: input.title,
    };

    const saved = yield* itemRepo.create(item);

    return saved;
  });
