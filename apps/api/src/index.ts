import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';

import { auth } from './auth';
import { AppError } from './lib/app-error';
import { authMiddleware } from './middleware/auth';
import { feedRoutes } from './routes/feed';
import { itemRoutes } from './routes/item';
import { rssRoutes } from './routes/rss';

const app = new Hono();

// 1. Auth API (no middleware, better-auth handles its own auth)
app.on(['POST', 'GET'], '/api/auth/*', (c) => {
  return auth.handler(c.req.raw);
});

// 2. Public RSS (no middleware, must be before static catch-all)
app.route('/', rssRoutes);

// 3. Protected API
app.use('/api/*', authMiddleware);
app.route('/api', feedRoutes);
app.route('/api', itemRoutes);

// 4. Static files last
app.use('/*', serveStatic({ root: '../client/dist' }));
app.get('*', serveStatic({ path: '../client/dist/index.html' }));

// 5. Unified error handler
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

const port = Number(process.env.API_PORT) || 3001;

console.log(`API server running on http://localhost:${port}`);
serve({ fetch: app.fetch, port });
