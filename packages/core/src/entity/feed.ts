import { Schema } from 'effect';
import { ExtraData } from './json.js';
import { UserId } from './user.js';

export const FeedId = Schema.String.pipe(Schema.brand('FeedId'));

export type FeedId = typeof FeedId.Type;

export const Feed = Schema.Struct({
  createdAt: Schema.Date,
  description: Schema.NonEmptyTrimmedString,
  extraData: ExtraData,
  id: FeedId,
  link: Schema.URL,
  title: Schema.NonEmptyTrimmedString,
  updatedAt: Schema.Date,
  userId: UserId,
});

export type Feed = typeof Feed.Type;
