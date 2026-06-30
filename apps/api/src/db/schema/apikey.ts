import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const apikey = sqliteTable(
  'apikey',
  {
    configId: text('config_id').notNull().default('default'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    enabled: integer('enabled', { mode: 'boolean' }).default(true),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }),
    id: text('id').primaryKey(),
    key: text('key').notNull(),
    lastRefillAt: integer('last_refill_at', { mode: 'timestamp_ms' }),
    lastRequest: integer('last_request', { mode: 'timestamp_ms' }),
    metadata: text('metadata'),
    name: text('name'),
    permissions: text('permissions'),
    prefix: text('prefix'),
    rateLimitEnabled: integer('rate_limit_enabled', { mode: 'boolean' }),
    rateLimitMax: integer('rate_limit_max'),
    rateLimitTimeWindow: integer('rate_limit_time_window'),
    referenceId: text('reference_id').notNull(),
    refillAmount: integer('refill_amount'),
    refillInterval: integer('refill_interval'),
    remaining: integer('remaining'),
    requestCount: integer('request_count'),
    start: text('start'),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('apikey_reference_id_idx').on(table.referenceId),
    index('apikey_config_id_idx').on(table.configId),
  ]
);
