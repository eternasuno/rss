import { createFileRoute } from '@tanstack/solid-router';
import { count } from 'drizzle-orm';
import { auth } from '../lib/auth';
import { db } from '../db';
import { user } from '../db/schema';

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: async ({ request }) => auth.handler(request),
      POST: async ({ request }) => {
        // Block sign-up if a user already exists (single-user setup)
        const url = new URL(request.url);
        if (url.pathname.endsWith('/sign-up/email')) {
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
