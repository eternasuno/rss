import { eq } from 'drizzle-orm';
import { Schema } from 'effect';
import { Hono } from 'hono';

import { db, schema } from '../db';
import { FeedData } from '../entity/feed';
import { AppError } from '../lib/app-error';

export const feedRoutes = new Hono();

// GET /api/feeds — list current user's feeds
feedRoutes.get('/feeds', async (c) => {
  const userId = c.get('userId');
  const rows = await db.query.feed.findMany({
    orderBy: (fields, { desc }) => desc(fields.createdAt),
    where: { userId },
  });
  return c.json(rows);
});

// POST /api/feeds — create a feed
feedRoutes.post('/feeds', async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();

  const result = Schema.decodeUnknownEither(FeedData)(body);
  if (result._tag === 'Left') {
    throw AppError.validation(result.left);
  }
  const data = result.right;

  const id = crypto.randomUUID();
  await db.insert(schema.feed).values({
    description: data.description,
    extraData: JSON.stringify(data.extraData),
    id,
    link: data.link.toString(),
    title: data.title,
    userId,
  });

  // Invalidate cache
  await db.delete(schema.feedXml).where(eq(schema.feedXml.feedId, id));

  const row = await db.query.feed.findFirst({
    where: { id },
  });
  return c.json(row, 201);
});

// GET /api/feeds/:feedId — get feed detail
feedRoutes.get('/feeds/:feedId', async (c) => {
  const userId = c.get('userId');
  const feedId = c.req.param('feedId');
  if (!feedId) {
    throw AppError.notFound('Feed not found');
  }

  const row = await db.query.feed.findFirst({
    where: { id: feedId },
  });
  if (!row) {
    throw AppError.notFound('Feed not found');
  }
  if (row.userId !== userId) {
    throw AppError.unauthorized();
  }
  return c.json(row);
});

// PATCH /api/feeds/:feedId — update feed
feedRoutes.patch('/feeds/:feedId', async (c) => {
  const userId = c.get('userId');
  const feedId = c.req.param('feedId');
  if (!feedId) {
    throw AppError.notFound('Feed not found');
  }

  const row = await db.query.feed.findFirst({
    where: { id: feedId },
  });
  if (!row) {
    throw AppError.notFound('Feed not found');
  }
  if (row.userId !== userId) {
    throw AppError.unauthorized();
  }

  const body = await c.req.json();

  const result = Schema.decodeUnknownEither(Schema.partial(FeedData))(body);
  if (result._tag === 'Left') {
    throw AppError.validation(result.left);
  }
  const data = result.right;

  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) {
    updateData.title = data.title;
  }
  if (data.description !== undefined) {
    updateData.description = data.description;
  }
  if (data.link !== undefined) {
    updateData.link = data.link.toString();
  }
  if (data.extraData !== undefined) {
    updateData.extraData = JSON.stringify(data.extraData);
  }

  await db.update(schema.feed).set(updateData).where(eq(schema.feed.id, feedId));

  // Invalidate cache
  await db.delete(schema.feedXml).where(eq(schema.feedXml.feedId, feedId));

  const updated = await db.query.feed.findFirst({
    where: { id: feedId },
  });
  return c.json(updated);
});

// DELETE /api/feeds/:feedId — delete feed (cascades items + feed_xml)
feedRoutes.delete('/feeds/:feedId', async (c) => {
  const userId = c.get('userId');
  const feedId = c.req.param('feedId');
  if (!feedId) {
    throw AppError.notFound('Feed not found');
  }

  const row = await db.query.feed.findFirst({
    where: { id: feedId },
  });
  if (!row) {
    throw AppError.notFound('Feed not found');
  }
  if (row.userId !== userId) {
    throw AppError.unauthorized();
  }

  await db.delete(schema.feed).where(eq(schema.feed.id, feedId));
  return c.body(null, 204);
});
