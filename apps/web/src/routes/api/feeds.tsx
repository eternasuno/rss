import { createFileRoute } from '@tanstack/solid-router';
import { getAuth } from '~/lib/auth';
import { AppRuntime } from '~/lib/runtime';
import { createFeed } from '@rss/core/usecase';
import { FeedData, UserId } from '@rss/core/entity';
import { Schema } from 'effect';

export const Route = createFileRoute('/api/feeds')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const auth = await getAuth();
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 401,
          });
        }

        const body = await request.json();
        const feedData = Schema.decodeUnknownSync(FeedData)(body);

        const feed = await AppRuntime.runPromise(
          createFeed({ data: feedData, userId: UserId.make(session.user.id) }),
        );

        return new Response(JSON.stringify(feed), {
          headers: { 'Content-Type': 'application/json' },
          status: 201,
        });
      },
    },
  },
});
