'use server';

import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { db } from '@/db';
import { feed as feedTable, item as itemTable } from '@/db/schema';
import { auth } from '@/lib/auth';

// Helper: get current userId from session
async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session.user.id;
}

// ── Feed CRUD ──

export async function createFeed(data: {
  title: string;
  description?: string;
  link?: string;
  language?: string;
  siteUrl?: string;
  copyright?: string;
  imageUrl?: string;
  authorName?: string;
}) {
  const userId = await getUserId();
  const id = crypto.randomUUID();
  const now = new Date();

  // biome-ignore lint/style/noNonNullAssertion: returning() always returns
  const result = db
    .insert(feedTable)
    .values({
      authorName: data.authorName ?? null,
      copyright: data.copyright ?? null,
      createdAt: now,
      description: data.description ?? '',
      id,
      imageUrl: data.imageUrl ?? null,
      language: data.language ?? 'en',
      link: data.link ?? '',
      rssXml: null,
      siteUrl: data.siteUrl ?? null,
      title: data.title,
      updatedAt: now,
      userId,
      // biome-ignore lint/suspicious/noExplicitAny: drizzle-orm TS 6.0 compat
    } as any)
    .returning()
    .get()!;

  return result;
}

export async function updateFeed(
  feedId: string,
  data: {
    title?: string;
    description?: string;
    link?: string;
    language?: string;
    siteUrl?: string;
    copyright?: string;
    imageUrl?: string;
    authorName?: string;
  }
) {
  const userId = await getUserId();

  const existing = db.select().from(feedTable).where(eq(feedTable.id, feedId)).get();
  if (!existing) {
    return { error: 'Feed not found' as const };
  }
  if (existing.userId !== userId) {
    return { error: 'Forbidden' as const };
  }

  const updateData: Record<string, unknown> = {
    rssXml: null,
    ...Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined)),
  };

  // biome-ignore lint/style/noNonNullAssertion: returning() always returns if not throwing
  const result = db
    .update(feedTable)
    .set(updateData)
    .where(eq(feedTable.id, feedId))
    .returning()
    .get()!;

  return result;
}

export async function deleteFeed(feedId: string) {
  const userId = await getUserId();

  const existing = db.select().from(feedTable).where(eq(feedTable.id, feedId)).get();
  if (!existing) {
    return { error: 'Feed not found' as const };
  }
  if (existing.userId !== userId) {
    return { error: 'Forbidden' as const };
  }

  db.delete(feedTable).where(eq(feedTable.id, feedId)).run();

  return { success: true };
}

export async function getUserFeeds() {
  const userId = await getUserId();

  const feeds = db.select().from(feedTable).where(eq(feedTable.userId, userId)).all();

  return feeds;
}

export async function getFeed(feedId: string) {
  const userId = await getUserId();

  const feedData = db.select().from(feedTable).where(eq(feedTable.id, feedId)).get();
  if (!feedData) {
    return { error: 'Feed not found' as const };
  }
  if (feedData.userId !== userId) {
    return { error: 'Forbidden' as const };
  }

  const items = db.select().from(itemTable).where(eq(itemTable.feedId, feedId)).all();

  return { feed: feedData, items };
}

// ── Item CRUD ──

function checkFeedOwnership(feedId: string, userId: string) {
  const feedData = db.select().from(feedTable).where(eq(feedTable.id, feedId)).get();
  if (!feedData) {
    return { error: 'Feed not found' as const };
  }
  if (feedData.userId !== userId) {
    return { error: 'Forbidden' as const };
  }
  return { feedData };
}

export async function addItem(
  feedId: string,
  data: {
    title: string;
    link?: string;
    description?: string;
    author?: string;
    content?: string;
    pubDate?: number;
    guid?: string;
  }
) {
  const userId = await getUserId();

  const ownership = checkFeedOwnership(feedId, userId);
  if ('error' in ownership) {
    return ownership;
  }

  const id = crypto.randomUUID();
  const guid = data.guid ?? id;
  const now = new Date();

  const result = db
    .insert(itemTable)
    .values({
      author: data.author ?? null,
      content: data.content ?? null,
      createdAt: now,
      description: data.description ?? null,
      feedId,
      guid,
      id,
      link: data.link ?? null,
      pubDate: data.pubDate ? new Date(data.pubDate) : null,
      title: data.title,
      updatedAt: now,
    } as any)
    .returning()
    .get();

  // Mark RSS XML as stale (lazy regeneration)
  db.update(feedTable).set({ rssXml: null }).where(eq(feedTable.id, feedId)).run();

  if (!result) {
    return { error: 'Failed to create item' as const };
  }

  return result;
}

export async function deleteItem(feedId: string, itemId: string) {
  const userId = await getUserId();

  const feedData = db.select().from(feedTable).where(eq(feedTable.id, feedId)).get();
  if (!feedData) {
    return { error: 'Feed not found' as const };
  }
  if (feedData.userId !== userId) {
    return { error: 'Forbidden' as const };
  }

  db.delete(itemTable).where(eq(itemTable.id, itemId)).run();

  // Mark RSS XML as stale (lazy regeneration)
  db.update(feedTable).set({ rssXml: null }).where(eq(feedTable.id, feedId)).run();

  return { success: true };
}
