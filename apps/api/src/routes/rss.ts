import { generateRssFeed } from 'feedsmith';
import type { Rss } from 'feedsmith/types';
import { Hono } from 'hono';

import { db, schema } from '../db';
import { AppError } from '../lib/app-error';

export const rssRoutes = new Hono();

rssRoutes.get('/rss/:feedId.xml', async (c) => {
  const feedId = c.req.param('feedId');
  if (!feedId) {
    throw AppError.notFound('Feed not found');
  }

  // 1. Cache hit → return directly
  const cached = await db.query.feedXml.findFirst({
    where: { feedId },
  });
  if (cached?.xml) {
    return c.body(cached.xml, 200, { 'Content-Type': 'application/rss+xml; charset=utf-8' });
  }

  // 2. Cache miss → generate on the fly
  const feedRow = await db.query.feed.findFirst({
    where: { id: feedId },
    with: { items: true },
  });

  if (!feedRow) {
    throw AppError.notFound('Feed not found');
  }

  const items = feedRow.items as Array<{
    extraData: string | null;
    id: string;
    pubDate: Date | null;
    title: string;
  }>;

  const feedData: Rss.Feed<Date> = {
    description: feedRow.description,
    items: items.map((item) => {
      const extra = item.extraData ? JSON.parse(item.extraData) : {};
      return {
        authors: extra.author ? [extra.author] : undefined,
        description: extra.description || undefined,
        guid: { isPermaLink: false, value: item.id },
        link: extra.link || undefined,
        pubDate: item.pubDate ? new Date(item.pubDate) : undefined,
        title: item.title,
      };
    }),
    link: feedRow.link,
    title: feedRow.title,
  };

  const xml = generateRssFeed(feedData);

  // 3. Backfill cache
  await db
    .insert(schema.feedXml)
    .values({ feedId, xml })
    .onConflictDoUpdate({ set: { xml }, target: schema.feedXml.feedId });

  return c.body(xml, 200, { 'Content-Type': 'application/rss+xml; charset=utf-8' });
});
