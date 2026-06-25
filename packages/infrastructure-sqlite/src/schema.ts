import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const feeds = sqliteTable('feeds', {
  createdAt: text('created_at').notNull(),
  data: text('data', { mode: 'json' }).$type<Record<string, unknown>>().default({}),
  description: text('description').notNull(),
  id: text('id').primaryKey(),
  link: text('link').notNull(),
  title: text('title').notNull(),
  updatedAt: text('updated_at').notNull(),
  userId: text('user_id').notNull(),
});

export const items = sqliteTable('items', {
  createdAt: text('created_at').notNull(),
  data: text('data', { mode: 'json' }).$type<Record<string, unknown>>().default({}),
  feedId: text('feed_id').notNull(),
  id: text('id').primaryKey(),
  title: text('title').notNull(),
});
