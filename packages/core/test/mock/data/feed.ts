import { DateTime } from 'effect';
import { type Feed, type FeedData, FeedId } from '../../../src/entity/feed.js';
import { UserId } from '../../../src/entity/value-object.js';

export const sampleFeedData = {
  description: 'A test feed description',
  link: new URL('https://example.com/feed'),
  title: 'Test Feed',
} as typeof FeedData.Type;

export const sampleFeedId = FeedId.make('feed-0001');

export const sampleUserId = UserId.make('user-0001');

const epoch = DateTime.unsafeMake(0);

export const sampleFeed: Feed = {
  createdAt: epoch,
  data: sampleFeedData,
  id: sampleFeedId,
  userId: sampleUserId,
};
