import * as D from 'drizzle-orm/sqlite-core';

export const verification = D.sqliteTable('verification', {
  createdAt: D.integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  expiresAt: D.integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
  id: D.text('id').primaryKey(),
  identifier: D.text('identifier').notNull(),
  updatedAt: D.integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  value: D.text('value').notNull(),
});
