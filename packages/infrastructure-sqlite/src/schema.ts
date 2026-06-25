import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  createdAt: text('created_at').notNull(),
  email: text('email').unique().notNull(),
  id: text('id').primaryKey(),
  passwordHash: text('password_hash').notNull(),
});

export const apiKeys = sqliteTable('api_keys', {
  createdAt: text('created_at').notNull(),
  expiresAt: text('expires_at'),
  id: text('id').primaryKey(),
  key: text('key').unique().notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
});

export const feeds = sqliteTable('feeds', {
  createdAt: text('created_at').notNull(),
  data: text('data', { mode: 'json' }).$type<Record<string, unknown>>().default({}),
  description: text('description').notNull(),
  id: text('id').primaryKey(),
  link: text('link').notNull(),
  title: text('title').notNull(),
  updatedAt: text('updated_at').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
});

export const items = sqliteTable('items', {
  createdAt: text('created_at').notNull(),
  data: text('data', { mode: 'json' }).$type<Record<string, unknown>>().default({}),
  feedId: text('feed_id')
    .notNull()
    .references(() => feeds.id),
  id: text('id').primaryKey(),
  title: text('title').notNull(),
});
