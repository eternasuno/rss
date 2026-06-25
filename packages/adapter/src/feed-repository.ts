import * as SqliteDrizzle from '@effect/sql-drizzle/Sqlite';
import { type Feed, type FeedData, FeedId, UserId } from '@rss/core/entity';
import { AppError, FeedRepository, type IFeedRepository } from '@rss/core/port';
import { feeds } from '@rss/infrastructure-sqlite/schema';
import { eq, inArray } from 'drizzle-orm';
import type { SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy';
import { DateTime, Effect, Layer, Option } from 'effect';

type DbFeed = {
  createdAt: string;
  data: Record<string, unknown> | null;
  description: string;
  id: string;
  link: string;
  title: string;
  updatedAt: string;
  userId: string;
};

const toFeed = (row: DbFeed): Feed => ({
  createdAt: DateTime.unsafeMake(new Date(row.createdAt)),
  data: {
    ...(row.data as Record<string, unknown>),
    description: row.description,
    link: new URL(row.link),
    title: row.title,
  } as typeof FeedData.Type,
  id: FeedId.make(row.id),
  userId: UserId.make(row.userId),
});

const fromFeed = (feed: Feed) => {
  const { title, description, link, ...extraData } = feed.data;
  const iso = new Date(feed.createdAt.epochMillis).toISOString();

  return {
    createdAt: iso,
    data: extraData as Record<string, unknown>,
    description: description as string,
    id: feed.id as string,
    link: (link as URL).toString(),
    title: title as string,
    updatedAt: iso,
    userId: feed.userId as string,
  };
};

const handleError = (error: unknown) =>
  new AppError({ code: 'INTERNAL_ERROR', message: String(error) });

const makeCreate = (db: SqliteRemoteDatabase) => (feed: Feed) =>
  Effect.gen(function* () {
    yield* db.insert(feeds).values(fromFeed(feed));
    return feed;
  }).pipe(Effect.catchAll(handleError));

const makeDelete = (db: SqliteRemoteDatabase) => (ids: ReadonlyArray<FeedId>) =>
  Effect.gen(function* () {
    yield* db.delete(feeds).where(inArray(feeds.id, [...ids]));
  }).pipe(Effect.catchAll(handleError));

const makeFindById = (db: SqliteRemoteDatabase) => (id: FeedId) =>
  Effect.gen(function* () {
    const rows = yield* db.select().from(feeds).where(eq(feeds.id, id));
    return rows.length > 0 ? Option.some(toFeed(rows[0])) : Option.none();
  }).pipe(Effect.catchAll(handleError));

const makeFindByUserId = (db: SqliteRemoteDatabase) => (userId: UserId) =>
  Effect.gen(function* () {
    const rows = yield* db.select().from(feeds).where(eq(feeds.userId, userId));
    return rows.map(toFeed);
  }).pipe(Effect.catchAll(handleError));

const mergeUpdateSet = ({
  existing,
  params,
}: {
  existing: DbFeed;
  params: Partial<FeedData>;
}): Record<string, unknown> => {
  const { title, description, link, ...extraParams } = params;
  const mergedData = { ...(existing.data as Record<string, unknown>), ...extraParams };
  const set: Record<string, unknown> = { data: mergedData, updatedAt: new Date().toISOString() };
  if (title !== undefined) {
    set.title = title;
  }
  if (description !== undefined) {
    set.description = description;
  }
  if (link !== undefined) {
    set.link = (link as URL).toString();
  }

  return set;
};

const makeUpdate = (db: SqliteRemoteDatabase) => (id: FeedId) => (params: Partial<FeedData>) =>
  Effect.gen(function* () {
    const existing = yield* db.select().from(feeds).where(eq(feeds.id, id));
    if (existing.length === 0) {
      return yield* new AppError({ code: 'NOT_FOUND', message: 'Feed not found' });
    }
    yield* db
      .update(feeds)
      .set(mergeUpdateSet({ existing: existing[0], params }))
      .where(eq(feeds.id, id));
  }).pipe(
    Effect.catchAll((error) => {
      if (error instanceof AppError) {
        return error;
      }

      return handleError(error);
    })
  );

export const createFeedRepository = (db: SqliteRemoteDatabase): IFeedRepository => ({
  create: makeCreate(db),
  delete: makeDelete(db),
  findById: makeFindById(db),
  findByUserId: makeFindByUserId(db),
  update: makeUpdate(db),
});

export const FeedRepositoryLive = Layer.effect(
  FeedRepository,
  Effect.gen(function* () {
    const db = yield* SqliteDrizzle.SqliteDrizzle;
    return createFeedRepository(db);
  })
);
