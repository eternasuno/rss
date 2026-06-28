import * as D from 'drizzle-orm/sqlite-core';

export const session = D.sqliteTable('session', {
  createdAt: D.integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  expiresAt: D.integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
  id: D.text('id').primaryKey(),
  ipAddress: D.text('ip_address'),
  token: D.text('token').notNull().unique(),
  updatedAt: D.integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  userAgent: D.text('user_agent'),
  userId: D.text('user_id').notNull(),
});
