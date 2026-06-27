import * as D from 'drizzle-orm/sqlite-core';

export const user = D.sqliteTable('user', {
  createdAt: D.integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  email: D.text('email').notNull().unique(),
  emailVerified: D.integer('email_verified', { mode: 'boolean' }).notNull(),
  id: D.text('id').primaryKey(),
  image: D.text('image'),
  name: D.text('name').notNull(),
  updatedAt: D.integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});
