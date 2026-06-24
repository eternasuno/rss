import { Schema } from 'effect';
import { ExtraData, UserId } from './value-object.js';
export const FeedId = Schema.String.pipe(Schema.brand('FeedId'));

export type FeedId = typeof FeedId.Type;

export const Feed = Schema.Struct({
  createdAt: Schema.DateTimeUtcFromSelf,
  description: Schema.NonEmptyTrimmedString,
  extraData: ExtraData,
  id: FeedId,
  link: Schema.URL,
  title: Schema.NonEmptyTrimmedString,
  updatedAt: Schema.DateTimeUtcFromSelf,
  userId: UserId,
});

export type Feed = typeof Feed.Type;
