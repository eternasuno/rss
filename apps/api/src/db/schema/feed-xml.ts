import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { feed } from './feed';

export const feedXml = sqliteTable('feed_xml', {
  feedId: text('feed_id')
    .primaryKey()
    .references(() => feed.id, { onDelete: 'cascade' }),
  xml: text('xml').notNull(),
});
