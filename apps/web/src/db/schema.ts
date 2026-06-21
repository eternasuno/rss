import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  createdAt: text('created_at').notNull(),
});

export const apiKeys = sqliteTable('api_keys', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  key: text('key').unique().notNull(),
  expiresAt: text('expires_at'),
  createdAt: text('created_at').notNull(),
});

export const feeds = sqliteTable('feeds', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  link: text('link').notNull(),
  data: text('data', { mode: 'json' }).$type<Record<string, unknown>>().default({}),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const items = sqliteTable('items', {
  id: text('id').primaryKey(),
  feedId: text('feed_id')
    .notNull()
    .references(() => feeds.id),
  title: text('title').notNull(),
  data: text('data', { mode: 'json' }).$type<Record<string, unknown>>().default({}),
  createdAt: text('created_at').notNull(),
});
