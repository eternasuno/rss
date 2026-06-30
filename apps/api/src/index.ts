import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';

import { auth } from './auth';

const app = new Hono();

app.on(['POST', 'GET'], '/api/auth/*', (c) => {
  return auth.handler(c.req.raw);
});

app.use('/*', serveStatic({ root: '../client/dist' }));
app.get('*', serveStatic({ path: '../client/dist/index.html' }));

const port = Number(process.env.API_PORT) || 3001;

console.log(`API server running on http://localhost:${port}`);
serve({ fetch: app.fetch, port });
