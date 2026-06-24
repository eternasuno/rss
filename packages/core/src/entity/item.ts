import { Schema } from 'effect';
import { FeedId } from './feed.js';
import { ExtraData } from './value-object.js';

export const ItemId = Schema.String.pipe(Schema.brand('ItemId'));

export type ItemId = typeof ItemId.Type;

export const Item = Schema.Struct({
  createdAt: Schema.DateTimeUtcFromSelf,
  extraData: ExtraData,
  feedId: FeedId,
  id: ItemId,
  title: Schema.NonEmptyTrimmedString,
});

export type Item = typeof Item.Type;
