import { type Feed, type FeedData, FeedId, UserId } from '@rss/core/entity';
import { AppError, FeedRepository, type IFeedRepository } from '@rss/core/port';
import { createClient } from '@rss/infrastructure-sqlite/db';
import { feeds } from '@rss/infrastructure-sqlite/schema';
import { eq, inArray } from 'drizzle-orm';
import { DateTime, Effect, Layer, Option } from 'effect';

type Client = ReturnType<typeof createClient>;
type DbFeed = typeof feeds.$inferSelect;

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

const makeCreate =
  (db: Client) =>
  (feed: Feed): Effect.Effect<Feed, AppError> =>
    Effect.try({
      catch: (error) => new AppError({ code: 'INTERNAL_ERROR', message: String(error) }),
      try: () => {
        db.insert(feeds).values(fromFeed(feed)).run();
        return feed;
      },
    });

const makeFindById =
  (db: Client) =>
  (id: FeedId): Effect.Effect<Option.Option<Feed>, AppError> =>
    Effect.sync(() => {
      const row = db.select().from(feeds).where(eq(feeds.id, id)).get();
      if (row) {
        return Option.some(toFeed(row));
      }
      return Option.none();
    });

const makeFindByUserId =
  (db: Client) =>
  (userId: UserId): Effect.Effect<ReadonlyArray<Feed>, AppError> =>
    Effect.sync(() => db.select().from(feeds).where(eq(feeds.userId, userId)).all().map(toFeed));

const findExisting = ({ db, id }: { db: Client; id: FeedId }): DbFeed => {
  const existing = db.select().from(feeds).where(eq(feeds.id, id)).get();
  if (!existing) {
    throw new Error('Feed not found');
  }
  return existing;
};

const buildUpdateSet = ({
  existing,
  params,
}: {
  existing: DbFeed;
  params: Partial<FeedData>;
}): Record<string, unknown> => {
  const { title, description, link, ...extraParams } = params;
  const mergedData = {
    ...(existing.data as Record<string, unknown>),
    ...extraParams,
  };
  const set: Record<string, unknown> = {
    data: mergedData,
    updatedAt: new Date().toISOString(),
  };

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

const applyUpdate = ({
  db,
  id,
  params,
}: {
  db: Client;
  id: FeedId;
  params: Partial<FeedData>;
}): void => {
  const existing = findExisting({ db, id });
  const set = buildUpdateSet({ existing, params });
  db.update(feeds).set(set).where(eq(feeds.id, id)).run();
};

const makeUpdate =
  (db: Client) =>
  (id: FeedId): ((params: Partial<FeedData>) => Effect.Effect<void, AppError>) =>
  (params) =>
    Effect.try({
      catch: (error) => new AppError({ code: 'INTERNAL_ERROR', message: String(error) }),
      try: () => applyUpdate({ db, id, params }),
    });

const makeDelete =
  (db: Client) =>
  (ids: ReadonlyArray<FeedId>): Effect.Effect<void, AppError> =>
    Effect.sync(() => {
      db.delete(feeds)
        .where(inArray(feeds.id, [...ids]))
        .run();
    });

export const createFeedRepository = (dbOrPath?: Client | string): IFeedRepository => {
  const db =
    dbOrPath === undefined || typeof dbOrPath === 'string' ? createClient(dbOrPath) : dbOrPath;

  return {
    create: makeCreate(db),
    delete: makeDelete(db),
    findById: makeFindById(db),
    findByUserId: makeFindByUserId(db),
    update: makeUpdate(db),
  };
};

export const SqliteFeedRepositoryLayer = (dbPath?: string) =>
  Layer.sync(FeedRepository, () => createFeedRepository(dbPath));
