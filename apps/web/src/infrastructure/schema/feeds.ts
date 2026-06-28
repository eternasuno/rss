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
