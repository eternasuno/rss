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
  createdAt: D.integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  email: D.text('email').notNull().unique(),
  emailVerified: D.integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  id: D.text('id').primaryKey(),
  image: D.text('image'),
  name: D.text('name').notNull(),
  updatedAt: D.integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});

export const session = D.sqliteTable('session', {
  createdAt: D.integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  expiresAt: D.integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
  id: D.text('id').primaryKey(),
  ipAddress: D.text('ip_address'),
  token: D.text('token').notNull().unique(),
  updatedAt: D.integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  userAgent: D.text('user_agent'),
  userId: D.text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

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
  userId: D.text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const verification = D.sqliteTable('verification', {
  createdAt: D.integer('created_at', { mode: 'timestamp_ms' }),
  expiresAt: D.integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
  id: D.text('id').primaryKey(),
  identifier: D.text('identifier').notNull(),
  updatedAt: D.integer('updated_at', { mode: 'timestamp_ms' }),
  value: D.text('value').notNull(),
});

export const apiKey = D.sqliteTable('api_key', {
  configId: D.text('config_id').notNull().default('default'),
  createdAt: D.integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  enabled: D.integer('enabled', { mode: 'boolean' }).notNull().default(true),
  expiresAt: D.integer('expires_at', { mode: 'timestamp_ms' }),
  id: D.text('id').primaryKey(),
  key: D.text('key').notNull().unique(),
  metadata: D.text('metadata', { mode: 'json' }).$type<Record<string, unknown>>(),
  name: D.text('name').notNull(),
  permissions: D.text('permissions', { mode: 'json' }).$type<Record<string, string[]>>(),
  rateLimitEnabled: D.integer('rate_limit_enabled', { mode: 'boolean' }),
  rateLimitMax: D.integer('rate_limit_max'),
  rateLimitTimeWindow: D.integer('rate_limit_time_window'),
  referenceId: D.text('reference_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  refillAmount: D.integer('refill_amount'),
  refillInterval: D.integer('refill_interval'),
  remaining: D.integer('remaining'),
  updatedAt: D.integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});
