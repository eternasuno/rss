import { createServerFn } from '@tanstack/solid-start';
import { asc, eq } from 'drizzle-orm';
import { db } from '../db';
import { apiKeys, feeds, items } from '../db/schema';
import { generateToken } from '../lib/auth';
import { generateFeedXml, writeFeedFile } from '../lib/feed-gen';
import { getSession } from '../utils/session';

export type CreateFeedInput = {
  title: string;
  description: string;
  link: string;
  data?: Record<string, unknown>;
};

export const createFeedFn = createServerFn({ method: 'POST' })
  .validator((d: CreateFeedInput) => d)
  .handler(async ({ data: input }) => {
    const session = await getSession();
    const userId = session.get('userId');
    if (!userId) throw new Error('Unauthorized');

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    db.insert(feeds)
      .values({
        createdAt: now,
        data: input.data ?? {},
        description: input.description,
        id,
        link: input.link,
        title: input.title,
        updatedAt: now,
        userId,
      })
      .run();

    let keyRecord = db.select().from(apiKeys).where(eq(apiKeys.userId, userId)).get();

    if (!keyRecord) {
      const keyId = crypto.randomUUID();
      const keyValue = generateToken();
      db.insert(apiKeys)
        .values({
          createdAt: now,
          id: keyId,
          key: keyValue,
          userId,
        })
        .run();
      keyRecord = { createdAt: now, expiresAt: null, id: keyId, key: keyValue, userId };
    }

    return { data: { apiKey: keyRecord.key, feed: { id, ...input } }, success: true };
  });

export const listFeedsFn = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await getSession();
  const userId = session.get('userId');
  if (!userId) throw new Error('Unauthorized');

  return db.select().from(feeds).where(eq(feeds.userId, userId)).all();
});

export const getFeedDetailFn = createServerFn({ method: 'GET' })
  .validator((d: { id: string }) => d)
  .handler(async ({ data: { id } }) => {
    const session = await getSession();
    const userId = session.get('userId');
    if (!userId) throw new Error('Unauthorized');

    const feed = db.select().from(feeds).where(eq(feeds.id, id)).get();
    if (!feed || feed.userId !== userId) return null;

    const keyRecord = db.select().from(apiKeys).where(eq(apiKeys.userId, userId)).get();
    const feedItems = db
      .select()
      .from(items)
      .where(eq(items.feedId, id))
      .orderBy(asc(items.createdAt))
      .all();

    return { apiKey: keyRecord?.key, feed, items: feedItems };
  });

export const regenerateXmlFn = createServerFn({ method: 'POST' })
  .validator((d: { feedId: string }) => d)
  .handler(async ({ data: { feedId } }) => {
    const session = await getSession();
    const userId = session.get('userId');
    if (!userId) throw new Error('Unauthorized');

    const feed = db.select().from(feeds).where(eq(feeds.id, feedId)).get();
    if (!feed || feed.userId !== userId) throw new Error('Not found');

    const allItems = db.select().from(items).where(eq(items.feedId, feedId)).all();
    const xml = generateFeedXml({ feed, items: allItems });
    writeFeedFile({ feedId, xml });

    return { success: true };
  });
