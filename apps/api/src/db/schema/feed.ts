import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { user } from './user';

export const feed = sqliteTable(
  'feed',
  {
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    description: text('description').notNull(),
    extraData: text('extra_data'),
    id: text('id').primaryKey(),
    link: text('link').notNull(),
    title: text('title').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => [index('feed_userId_idx').on(table.userId)]
);
