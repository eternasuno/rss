import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';

import { auth } from './auth';
import { AppError } from './lib/app-error';
import { dualAuthMiddleware } from './middleware/api-key';
import { authMiddleware } from './middleware/auth';
import { feedRoutes } from './routes/feed';
import { createItemHandler, itemRoutes } from './routes/item';
import { rssRoutes } from './routes/rss';

const app = new Hono();

// 1. Auth API (no middleware, better-auth handles its own auth)
app.all('/api/auth/*', (c) => {
  return auth.handler(c.req.raw);
});

// 2. Public RSS (no middleware, must be before static catch-all)
app.route('/', rssRoutes);

// 3. Item creation with dual auth (API key or session) — before blanket middleware
app.post('/api/feeds/:feedId/items', dualAuthMiddleware, createItemHandler);

// 4. Session-only protected API
app.use('/api/*', authMiddleware);
app.route('/api', feedRoutes);
app.route('/api', itemRoutes);

// 5. Static files last
app.use('/*', serveStatic({ root: '../client/dist' }));
app.get('*', serveStatic({ path: '../client/dist/index.html' }));

// 6. Unified error handler
app.onError((err, c) => {
  if (err instanceof AppError) {
    return c.json(
      { code: err.code, details: err.details, error: err.message },
      err.status as Parameters<typeof c.json>[1]
    );
  }
  console.error(err);
  return c.json({ code: 'INTERNAL', error: 'Internal Server Error' }, 500);
});

console.log(`API server running on http://localhost:3000`);

serve({ fetch: app.fetch });
