import { defineRelations } from 'drizzle-orm';

import * as schema from './schema';

export const relations = defineRelations(schema, (r) => ({
  account: {
    user: r.one.user({
      from: r.account.userId,
      to: r.user.id,
    }),
  },
  feed: {
    items: r.many.item(),
    user: r.one.user({
      from: r.feed.userId,
      to: r.user.id,
    }),
  },
  item: {
    feed: r.one.feed({
      from: r.item.feedId,
      to: r.feed.id,
    }),
  },
  session: {
    user: r.one.user({
      from: r.session.userId,
      to: r.user.id,
    }),
  },
  user: {
    accounts: r.many.account(),
    feeds: r.many.feed(),
    sessions: r.many.session(),
  },
}));
