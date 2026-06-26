import { createFileRoute } from '@tanstack/solid-router';
import { getAuth } from '~/lib/auth';

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const auth = await getAuth();

        return auth.handler(request);
      },
      POST: async ({ request }: { request: Request }) => {
        const auth = await getAuth();

        return auth.handler(request);
      },
    },
  },
});
