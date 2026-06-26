import { createFileRoute } from '@tanstack/solid-router';
import { Effect } from 'effect';
import { FeedId } from '@rss/core/entity';
import { addItem, getFeed } from '@rss/core/usecase';
import { generateXML } from '@rss/core/usecase';
import { AppRuntime } from '../lib/effect-runtime';
import { writeFeedFile } from '../lib/feed-gen';
import { getUserIdFromApiKey } from '../lib/auth-utils';

export const Route = createFileRoute('/api/$feedId/items')({
  server: {
    handlers: {
      POST: async ({ params, request }) => {
        const apiKeyHeader = request.headers.get('x-api-key');
        if (!apiKeyHeader) {
          return Response.json(
            { error: 'Missing X-API-Key header', success: false },
            { status: 401 }
          );
        }

        const keyUserId = await getUserIdFromApiKey(apiKeyHeader);
        if (!keyUserId) {
          return Response.json(
            { error: 'Invalid API key', success: false },
            { status: 401 }
          );
        }

        const feedResult = await AppRuntime.runPromise(
          getFeed(FeedId.make(params.feedId)).pipe(
            Effect.catchTag('AppError', () => Effect.succeed(null)),
          )
        );

        if (!feedResult || feedResult.feed.userId !== keyUserId) {
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

        const itemData =
          typeof body.data === 'object' && body.data !== null
            ? (body.data as Record<string, unknown>)
            : {};

        const item = await AppRuntime.runPromise(
          addItem({
            data: { title: body.title.trim(), ...itemData },
            feedId: FeedId.make(params.feedId),
          })
        );

        const xml = await AppRuntime.runPromise(generateXML(FeedId.make(params.feedId)));
        writeFeedFile({ feedId: params.feedId, xml });

        return Response.json({ data: { id: item.id }, success: true }, { status: 201 });
      },
    },
  },
});
