import * as D from 'drizzle-orm/sqlite-core';

export const feeds = D.sqliteTable(
  'feeds',
  {
    createdAt: D.integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    description: D.text('description').notNull(),
    extraData: D.text('data', { mode: 'json' }).$type<Record<string, unknown>>().default({}),
    id: D.text('id').primaryKey(),
    link: D.text('link').notNull(),
    title: D.text('title').notNull(),
    userId: D.text('user_id').notNull(),
  },
  (table) => [D.index('user_id_idx').on(table.userId)]
);

export const items = D.sqliteTable(
  'items',
  {
    createdAt: D.integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    extraData: D.text('data', { mode: 'json' }).$type<Record<string, unknown>>().default({}),
    feedId: D.text('feed_id').notNull(),
    id: D.text('id').primaryKey(),
    title: D.text('title').notNull(),
  },
  (table) => [D.index('feed_id_idx').on(table.feedId)]
);

// --- Better Auth tables ---

export const user = D.sqliteTable('user', {
  id: D.text('id').primaryKey(),
  name: D.text('name').notNull(),
  email: D.text('email').notNull().unique(),
  emailVerified: D.integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  image: D.text('image'),
  createdAt: D.integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: D.integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});

export const session = D.sqliteTable('session', {
  id: D.text('id').primaryKey(),
  expiresAt: D.integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
  token: D.text('token').notNull().unique(),
  createdAt: D.integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: D.integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  ipAddress: D.text('ip_address'),
  userAgent: D.text('user_agent'),
  userId: D.text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const account = D.sqliteTable('account', {
  id: D.text('id').primaryKey(),
  accountId: D.text('account_id').notNull(),
  providerId: D.text('provider_id').notNull(),
  userId: D.text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: D.text('access_token'),
  refreshToken: D.text('refresh_token'),
  idToken: D.text('id_token'),
  accessTokenExpiresAt: D.integer('access_token_expires_at', { mode: 'timestamp_ms' }),
  refreshTokenExpiresAt: D.integer('refresh_token_expires_at', { mode: 'timestamp_ms' }),
  scope: D.text('scope'),
  password: D.text('password'),
  createdAt: D.integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: D.integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});

export const verification = D.sqliteTable('verification', {
  id: D.text('id').primaryKey(),
  identifier: D.text('identifier').notNull(),
  value: D.text('value').notNull(),
  expiresAt: D.integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
  createdAt: D.integer('created_at', { mode: 'timestamp_ms' }),
  updatedAt: D.integer('updated_at', { mode: 'timestamp_ms' }),
});

export const apiKey = D.sqliteTable('api_key', {
  id: D.text('id').primaryKey(),
  name: D.text('name').notNull(),
  key: D.text('key').notNull().unique(),
  userId: D.text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  organizationId: D.text('organization_id'),
  enabled: D.integer('enabled', { mode: 'boolean' }).notNull().default(true),
  remaining: D.integer('remaining'),
  refillAmount: D.integer('refill_amount'),
  refillInterval: D.integer('refill_interval'),
  expiresAt: D.integer('expires_at', { mode: 'timestamp_ms' }),
  createdAt: D.integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: D.integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  permissions: D.text('permissions', { mode: 'json' }).$type<Record<string, string[]>>(),
  metadata: D.text('metadata', { mode: 'json' }).$type<Record<string, unknown>>(),
  rateLimitEnabled: D.integer('rate_limit_enabled', { mode: 'boolean' }),
  rateLimitTimeWindow: D.integer('rate_limit_time_window'),
  rateLimitMax: D.integer('rate_limit_max'),
});
