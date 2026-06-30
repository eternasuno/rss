import { DateTime, Schema } from 'effect';

import { ExtraData, UserId } from './value-object';

export const FeedId = Schema.String.pipe(Schema.brand('FeedId'));
export type FeedId = typeof FeedId.Type;

export const FeedData = Schema.Struct({
  description: Schema.NonEmptyTrimmedString,
  extraData: Schema.optionalWith(ExtraData, { default: () => ({}), nullable: true }),
  link: Schema.URL,
  title: Schema.NonEmptyTrimmedString,
});
export type FeedData = typeof FeedData.Type;

export const Feed = Schema.Struct({
  createdAt: Schema.optionalWith(Schema.DateTimeUtcFromDate, { default: DateTime.unsafeNow }),
  data: FeedData,
  id: FeedId,
  userId: UserId,
});
export type Feed = typeof Feed.Type;
