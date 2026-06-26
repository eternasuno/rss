import type { FeedId, Item, ItemData, ItemId } from '@rss/core/entity';
import { DateTime } from 'effect';

export const makeItem = (overrides: Partial<Item> = {}): Item => ({
  createdAt: DateTime.unsafeNow(),
  data: {
    title: 'Test Item',
  } as ItemData,
  feedId: 'test-feed-id' as FeedId,
  id: 'test-item-id' as ItemId,
  ...overrides,
});
