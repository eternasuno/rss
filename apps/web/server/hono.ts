import './env';
import { CryptoLive } from '@rss/adapter/crypto';
import { FeedGeneratorLive } from '@rss/adapter/feed-generator';
import { FeedRepositoryLive } from '@rss/adapter/feed-repository';
import { ItemRepositoryLive } from '@rss/adapter/item-repository';
import { FeedId, UserId } from '@rss/core/entity';
import { FeedRepository } from '@rss/core/port';
import { addItem, createFeed, generateXML } from '@rss/core/usecase';
import { DB } from '@rss/infrastructure-sqlite/db';
import { Effect, Layer, ManagedRuntime } from 'effect';
import { Hono } from 'hono';
import { renderPage } from 'vike/server';
import { auth } from './better-auth';

const runtime = ManagedRuntime.make(
  Layer.mergeAll(FeedRepositoryLive, ItemRepositoryLive, CryptoLive, FeedGeneratorLive).pipe(
    Layer.provideMerge(DB.Default)
  )
);

const app = new Hono();

app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw));

app.get('/api/feeds', async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const result = await runtime.runPromise(
    Effect.gen(function* () {
      const repo = yield* FeedRepository;

      return yield* repo.findByUserId(UserId.make(session.user.id));
    })
  );

  return c.json(result);
});

app.post('/api/feeds', async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const body = await c.req.json();

  const result = await runtime.runPromise(
    createFeed({ data: body.data, userId: UserId.make(session.user.id) })
  );

  return c.json(result);
});

app.get('/api/feeds/:feedId', async (c) => {
  const { feedId } = c.req.param();

  const result = await runtime.runPromise(
    Effect.gen(function* () {
      const repo = yield* FeedRepository;

      return yield* repo.findById(FeedId.make(feedId));
    })
  );

  return c.json(result);
});

app.post('/api/feeds/:feedId/items', async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const { feedId } = c.req.param();
  const body = await c.req.json();

  const result = await runtime.runPromise(
    addItem({ data: body.data, feedId: FeedId.make(feedId) })
  );

  return c.json(result);
});

app.get('/api/feeds/:feedId/xml', async (c) => {
  const { feedId } = c.req.param();

  const result = await runtime.runPromise(generateXML(FeedId.make(feedId)));

  return c.body(result, 200, { 'Content-Type': 'application/xml' });
});

app.all('*', async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  const pageContext = await renderPage({
    headersOriginal: c.req.raw.headers,
    urlOriginal: c.req.url,
    user: session?.user ?? null,
  });

  const { httpResponse } = pageContext;

  if (!httpResponse) {
    return c.notFound();
  }

  const { body, statusCode, headers } = httpResponse;

  return new Response(body, { headers, status: statusCode });
});

export { app };
