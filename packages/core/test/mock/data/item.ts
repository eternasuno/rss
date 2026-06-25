import { DateTime } from 'effect';
import { FeedId } from '../../../src/entity/feed.js';
import { type Item, type ItemData, ItemId } from '../../../src/entity/item.js';

export const sampleItemData = {
  title: 'Test Item Title',
} as typeof ItemData.Type;

export const sampleItemId = ItemId.make('item-0001');

export const sampleFeedId = FeedId.make('feed-0001');

const epoch = DateTime.unsafeMake(0);

export const sampleItem: Item = {
  createdAt: epoch,
  data: sampleItemData,
  feedId: sampleFeedId,
  id: sampleItemId,
};
