import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { feed } from './feed';

export const item = sqliteTable(
  'item',
  {
    extraData: text('extra_data'),
    feedId: text('feed_id')
      .notNull()
      .references(() => feed.id, { onDelete: 'cascade' }),
    id: text('id').primaryKey(),
    pubDate: integer('pub_date', { mode: 'timestamp_ms' }),
    title: text('title').notNull(),
  },
  (table) => [index('item_feedId_idx').on(table.feedId)]
);
