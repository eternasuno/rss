import { createFileRoute } from '@tanstack/solid-router';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { feeds } from '../db/schema';
import { readFeedFile } from '../lib/feed-gen';

export const Route = createFileRoute('/feed/$id')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const feed = db.select().from(feeds).where(eq(feeds.id, params.id)).get();
        if (!feed) {
          return new Response('Not Found', { status: 404 });
        }

        const cached = readFeedFile({ feedId: params.id });
        if (cached) {
          return new Response(cached, {
            headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
          });
        }

        return new Response('Not Found', { status: 404 });
      },
    },
  },
});
