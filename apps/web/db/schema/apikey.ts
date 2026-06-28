import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { user } from './user';

export const apikey = sqliteTable(
  'apikey',
  {
    configId: text('config_id').notNull().default('default'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }),
    id: text('id').primaryKey(),
    key: text('key').notNull(),
    lastRefillAt: integer('last_refill_at', { mode: 'timestamp_ms' }),
    lastRequest: integer('last_request', { mode: 'timestamp_ms' }),
    metadata: text('metadata'),
    name: text('name'),
    permissions: text('permissions'),
    prefix: text('prefix'),
    rateLimitEnabled: integer('rate_limit_enabled', { mode: 'boolean' }).notNull().default(true),
    rateLimitMax: integer('rate_limit_max'),
    rateLimitTimeWindow: integer('rate_limit_time_window'),
    referenceId: text('reference_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    refillAmount: integer('refill_amount'),
    refillInterval: integer('refill_interval'),
    remaining: integer('remaining'),
    requestCount: integer('request_count').notNull().default(0),
    start: text('start'),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    index('apikey_config_id_idx').on(table.configId),
    index('apikey_reference_id_idx').on(table.referenceId),
    index('apikey_key_idx').on(table.key),
  ]
);
