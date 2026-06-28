import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';
import { feed } from './feed';

export const item = sqliteTable(
  'item',
  {
    author: text('author'),
    content: text('content'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    description: text('description'),
    extraData: text('extra_data'),
    feedId: text('feed_id')
      .notNull()
      .references(() => feed.id, { onDelete: 'cascade' }),
    guid: text('guid').notNull(),
    id: text('id').primaryKey(),
    link: text('link'),
    pubDate: integer('pub_date', { mode: 'timestamp_ms' }),
    title: text('title').notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('item_feed_id_idx').on(table.feedId),
    unique('item_feed_guid_unique').on(table.feedId, table.guid),
  ]
);
