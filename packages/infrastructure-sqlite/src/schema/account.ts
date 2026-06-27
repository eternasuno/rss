import * as D from 'drizzle-orm/sqlite-core';

export const account = D.sqliteTable('account', {
  accessToken: D.text('access_token'),
  accessTokenExpiresAt: D.integer('access_token_expires_at', { mode: 'timestamp_ms' }),
  accountId: D.text('account_id').notNull(),
  createdAt: D.integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  id: D.text('id').primaryKey(),
  idToken: D.text('id_token'),
  password: D.text('password'),
  providerId: D.text('provider_id').notNull(),
  refreshToken: D.text('refresh_token'),
  refreshTokenExpiresAt: D.integer('refresh_token_expires_at', { mode: 'timestamp_ms' }),
  scope: D.text('scope'),
  updatedAt: D.integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  userId: D.text('user_id').notNull(),
});
