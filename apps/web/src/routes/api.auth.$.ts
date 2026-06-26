import { createFileRoute } from '@tanstack/solid-router';

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { auth } = await import('../lib/auth');

        return auth.handler(request);
      },
      POST: async ({ request }) => {
        const { auth } = await import('../lib/auth');
        const url = new URL(request.url);
        if (url.pathname.endsWith('/sign-up/email')) {
          const { count } = await import('drizzle-orm');
          const { db, user } = await import('../lib/db');
          const rows = await db.select({ count: count() }).from(user);
          if (rows[0].count > 0) {
            return Response.json(
              { code: 'REGISTRATION_CLOSED', message: 'Registration is closed' },
              { status: 403 },
            );
          }
        }

        return auth.handler(request);
      },
    },
  },
});
