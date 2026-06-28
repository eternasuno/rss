import { Schema } from 'effect';
import { FeedId } from './feed';
import { ExtraData } from './value-object';

export const ItemId = Schema.String.pipe(Schema.brand('ItemId'));

export type ItemId = typeof ItemId.Type;

export const ItemData = Schema.extend(
  Schema.Struct({
    title: Schema.NonEmptyTrimmedString,
  }),
  ExtraData
);

export type ItemData = typeof ItemData.Type;

export const Item = Schema.Struct({
  createdAt: Schema.DateTimeUtcFromSelf,
  data: ItemData,
  feedId: FeedId,
  id: ItemId,
});

export type Item = typeof Item.Type;
