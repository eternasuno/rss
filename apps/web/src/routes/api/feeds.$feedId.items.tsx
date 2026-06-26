import { createFileRoute } from '@tanstack/solid-router';
import { AppRuntime } from '~/lib/runtime';
import { addItem } from '@rss/core/usecase';
import { FeedId, ItemData } from '@rss/core/entity';
import { Schema } from 'effect';

export const Route = createFileRoute('/api/feeds/$feedId/items')({
  server: {
    handlers: {
      POST: async ({
        params,
        request,
      }: {
        params: { feedId: string };
        request: Request;
      }) => {
        const body = await request.json();
        const itemData = Schema.decodeUnknownSync(ItemData)(body);

        const item = await AppRuntime.runPromise(
          addItem({
            data: itemData,
            feedId: FeedId.make(params.feedId),
          }),
        );

        return new Response(JSON.stringify(item), {
          headers: { 'Content-Type': 'application/json' },
          status: 201,
        });
      },
    },
  },
});
