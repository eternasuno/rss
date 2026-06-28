import { Schema } from 'effect';
import { ExtraData, UserId } from './value-object';

export const FeedId = Schema.String.pipe(Schema.brand('FeedId'));

export type FeedId = typeof FeedId.Type;

export const FeedData = Schema.extend(
  Schema.Struct({
    description: Schema.NonEmptyTrimmedString,
    link: Schema.URL,
    title: Schema.NonEmptyTrimmedString,
  }),
  ExtraData
);

export type FeedData = typeof FeedData.Type;

export const Feed = Schema.Struct({
  createdAt: Schema.DateTimeUtcFromSelf,
  data: FeedData,
  id: FeedId,
  userId: UserId,
});

export type Feed = typeof Feed.Type;
