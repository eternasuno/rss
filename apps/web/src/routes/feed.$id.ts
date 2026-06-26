import { createFileRoute } from '@tanstack/solid-router';
import { readFeedFile } from '../lib/feed-gen';

export const Route = createFileRoute('/feed/$id')({
  server: {
    handlers: {
      GET: async ({ params }) => {
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
