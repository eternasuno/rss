import { createFileRoute } from '@tanstack/solid-router';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { apiKeys, feeds, items } from '../db/schema';
import { generateFeedXml, writeFeedFile } from '../lib/feed-gen';

export const Route = createFileRoute('/api/$feedId/items')({
  server: {
    handlers: {
      POST: async ({ params, request }) => {
        const apiKey = request.headers.get('x-api-key');
        if (!apiKey) {
          return Response.json(
            { error: 'Missing X-API-Key header', success: false },
            { status: 401 }
          );
        }

        const keyRecord = db.select().from(apiKeys).where(eq(apiKeys.key, apiKey)).get();
        if (!keyRecord) {
          return Response.json({ error: 'Invalid API key', success: false }, { status: 401 });
        }

        if (keyRecord.expiresAt && new Date(keyRecord.expiresAt) < new Date()) {
          return Response.json({ error: 'API key expired', success: false }, { status: 401 });
        }

        const feed = db.select().from(feeds).where(eq(feeds.id, params.feedId)).get();
        if (!feed || feed.userId !== keyRecord.userId) {
          return Response.json({ error: 'Feed not found', success: false }, { status: 404 });
        }

        let body: { title?: unknown; data?: unknown };
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: 'Invalid JSON body', success: false }, { status: 400 });
        }

        if (typeof body.title !== 'string' || body.title.trim().length === 0) {
          return Response.json(
            { error: 'title is required and must be a non-empty string', success: false },
            { status: 400 }
          );
        }

        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        const itemData =
          typeof body.data === 'object' && body.data !== null
            ? (body.data as Record<string, unknown>)
            : {};

        db.insert(items)
          .values({
            createdAt: now,
            data: itemData,
            feedId: feed.id,
            id,
            title: body.title.trim(),
          })
          .run();

        db.update(feeds).set({ updatedAt: now }).where(eq(feeds.id, feed.id)).run();

        const allItems = db.select().from(items).where(eq(items.feedId, feed.id)).all();
        const xml = generateFeedXml({ feed, items: allItems });
        writeFeedFile({ feedId: feed.id, xml });

        return Response.json({ data: { id }, success: true }, { status: 201 });
      },
    },
  },
});
