import { createFileRoute } from '@tanstack/solid-router';
import { AppRuntime } from '~/lib/runtime';
import { generateXML } from '@rss/core/usecase';
import { FeedId } from '@rss/core/entity';

export const Route = createFileRoute('/feed/$feedId')({
  server: {
    handlers: {
      GET: async ({ params }: { params: { feedId: string } }) => {
        const xml = await AppRuntime.runPromise(
          generateXML(FeedId.make(params.feedId)),
        );

        return new Response(xml, {
          headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
        });
      },
    },
  },
});
