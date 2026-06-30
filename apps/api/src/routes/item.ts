import { eq } from 'drizzle-orm';
import { DateTime, Schema } from 'effect';
import { Hono } from 'hono';

import { db, schema } from '../db';
import { ItemData } from '../entity/item';
import { AppError } from '../lib/app-error';

export const itemRoutes = new Hono();

// GET /api/feeds/:feedId/items — list items for a feed
itemRoutes.get('/feeds/:feedId/items', async (c) => {
  const userId = c.get('userId');
  const feedId = c.req.param('feedId');
  if (!feedId) {
    throw AppError.notFound('Feed not found');
  }

  const feed = await db.query.feed.findFirst({
    where: { id: feedId },
  });
  if (!feed) {
    throw AppError.notFound('Feed not found');
  }
  if (feed.userId !== userId) {
    throw AppError.unauthorized();
  }

  const rows = await db.query.item.findMany({
    orderBy: (fields, { desc }) => desc(fields.pubDate),
    where: { feedId },
  });
  return c.json(rows);
});

// POST /api/feeds/:feedId/items — create an item
itemRoutes.post('/feeds/:feedId/items', async (c) => {
  const userId = c.get('userId');
  const feedId = c.req.param('feedId');
  if (!feedId) {
    throw AppError.notFound('Feed not found');
  }

  const feed = await db.query.feed.findFirst({
    where: { id: feedId },
  });
  if (!feed) {
    throw AppError.notFound('Feed not found');
  }
  if (feed.userId !== userId) {
    throw AppError.unauthorized();
  }

  const body = await c.req.json();

  const result = Schema.decodeUnknownEither(ItemData)(body);
  if (result._tag === 'Left') {
    throw AppError.validation(result.left);
  }
  const data = result.right;

  const id = crypto.randomUUID();
  await db.insert(schema.item).values({
    extraData: JSON.stringify(data.extraData),
    feedId,
    id,
    pubDate: DateTime.toDate(data.pubDate),
    title: data.title,
  });

  // Invalidate cache
  await db.delete(schema.feedXml).where(eq(schema.feedXml.feedId, feedId));

  const row = await db.query.item.findFirst({
    where: { id },
  });
  return c.json(row, 201);
});

// PATCH /api/feeds/:feedId/items/:itemId — update an item
itemRoutes.patch('/feeds/:feedId/items/:itemId', async (c) => {
  const userId = c.get('userId');
  const feedId = c.req.param('feedId');
  const itemId = c.req.param('itemId');
  if (!feedId || !itemId) {
    throw AppError.notFound('Feed or Item not found');
  }

  const feed = await db.query.feed.findFirst({
    where: { id: feedId },
  });
  if (!feed) {
    throw AppError.notFound('Feed not found');
  }
  if (feed.userId !== userId) {
    throw AppError.unauthorized();
  }

  const existing = await db.query.item.findFirst({
    where: { id: itemId },
  });
  if (!existing || existing.feedId !== feedId) {
    throw AppError.notFound('Item not found');
  }

  const body = await c.req.json();

  const result = Schema.decodeUnknownEither(Schema.partial(ItemData))(body);
  if (result._tag === 'Left') {
    throw AppError.validation(result.left);
  }
  const data = result.right;

  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) {
    updateData.title = data.title;
  }
  if (data.pubDate !== undefined) {
    updateData.pubDate = DateTime.toDate(data.pubDate);
  }
  if (data.extraData !== undefined) {
    updateData.extraData = JSON.stringify(data.extraData);
  }

  await db.update(schema.item).set(updateData).where(eq(schema.item.id, itemId));

  // Invalidate cache
  await db.delete(schema.feedXml).where(eq(schema.feedXml.feedId, feedId));

  const updated = await db.query.item.findFirst({
    where: { id: itemId },
  });
  return c.json(updated);
});

// DELETE /api/feeds/:feedId/items/:itemId — delete an item
itemRoutes.delete('/feeds/:feedId/items/:itemId', async (c) => {
  const userId = c.get('userId');
  const feedId = c.req.param('feedId');
  const itemId = c.req.param('itemId');
  if (!feedId || !itemId) {
    throw AppError.notFound('Feed or Item not found');
  }

  const feed = await db.query.feed.findFirst({
    where: { id: feedId },
  });
  if (!feed) {
    throw AppError.notFound('Feed not found');
  }
  if (feed.userId !== userId) {
    throw AppError.unauthorized();
  }

  const existing = await db.query.item.findFirst({
    where: { id: itemId },
  });
  if (!existing || existing.feedId !== feedId) {
    throw AppError.notFound('Item not found');
  }

  await db.delete(schema.item).where(eq(schema.item.id, itemId));

  // Invalidate cache
  await db.delete(schema.feedXml).where(eq(schema.feedXml.feedId, feedId));

  return c.body(null, 204);
});
