import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// --- Feeds & Items (managed via packages' Effect-TS runtime) ---

export const feeds = sqliteTable('feeds', {
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  description: text('description').notNull(),
  extraData: text('data', { mode: 'json' }).$type<Record<string, unknown>>().default({}),
  id: text('id').primaryKey(),
  link: text('link').notNull(),
  title: text('title').notNull(),
  userId: text('user_id').notNull(),
});

export const items = sqliteTable('items', {
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  extraData: text('data', { mode: 'json' }).$type<Record<string, unknown>>().default({}),
  feedId: text('feed_id').notNull(),
  id: text('id').primaryKey(),
  title: text('title').notNull(),
});

// --- Better Auth tables ---

export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const account = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp_ms' }),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp_ms' }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});

export const verification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }),
});

// API key table for better-auth API key plugin
export const apiKey = sqliteTable('api_key', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  key: text('key').notNull().unique(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id'),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  remaining: integer('remaining'),
  refillAmount: integer('refill_amount'),
  refillInterval: integer('refill_interval'),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  permissions: text('permissions', { mode: 'json' }).$type<Record<string, string[]>>(),
  metadata: text('metadata', { mode: 'json' }).$type<Record<string, unknown>>(),
  rateLimitEnabled: integer('rate_limit_enabled', { mode: 'boolean' }),
  rateLimitTimeWindow: integer('rate_limit_time_window'),
  rateLimitMax: integer('rate_limit_max'),
});
