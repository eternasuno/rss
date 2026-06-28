import { DateTime } from 'effect';
import type { Feed, FeedData, FeedId, UserId } from '../../../src/core/entity';

export const makeFeed = (overrides: Partial<Feed> = {}): Feed => ({
  createdAt: DateTime.unsafeNow(),
  data: {
    description: 'Test description',
    link: new URL('https://example.com'),
    title: 'Test Feed',
  } as FeedData,
  id: 'test-feed-id' as FeedId,
  userId: 'test-user' as UserId,
  ...overrides,
});
