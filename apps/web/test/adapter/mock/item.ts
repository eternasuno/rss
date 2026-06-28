import { DateTime } from 'effect';
import type { FeedId, Item, ItemData, ItemId } from '../../../src/core/entity';

export const makeItem = (overrides: Partial<Item> = {}): Item => ({
  createdAt: DateTime.unsafeNow(),
  data: {
    title: 'Test Item',
  } as ItemData,
  feedId: 'test-feed-id' as FeedId,
  id: 'test-item-id' as ItemId,
  ...overrides,
});
