import * as D from 'drizzle-orm/sqlite-core';

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
