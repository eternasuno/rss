import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { user } from './user';

export const feed = sqliteTable(
  'feed',
  {
    authorName: text('author_name'),
    copyright: text('copyright'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    description: text('description').notNull().default(''),
    extraData: text('extra_data'),
    feedType: text('feed_type').notNull().default('rss'),
    id: text('id').primaryKey(),
    imageUrl: text('image_url'),
    language: text('language').notNull().default('en'),
    link: text('link').notNull().default(''),
    rssXml: text('rss_xml'),
    siteUrl: text('site_url'),
    title: text('title').notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => [index('feed_user_id_idx').on(table.userId)]
);
