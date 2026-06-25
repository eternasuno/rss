import * as SqliteDrizzle from '@effect/sql-drizzle/Sqlite';
import { FeedId, type Item, type ItemData, ItemId } from '@rss/core/entity';
import { AppError, type IItemRepository, ItemRepository } from '@rss/core/port';
import { items } from '@rss/infrastructure-sqlite/schema';
import { eq, inArray } from 'drizzle-orm';
import type { SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy';
import { DateTime, Effect, Layer, Option } from 'effect';

type DbItem = {
  createdAt: string;
  data: Record<string, unknown> | null;
  feedId: string;
  id: string;
  title: string;
};

const toItem = (row: DbItem): Item => ({
  createdAt: DateTime.unsafeMake(new Date(row.createdAt)),
  data: {
    ...(row.data as Record<string, unknown>),
    title: row.title,
  } as typeof ItemData.Type,
  feedId: FeedId.make(row.feedId),
  id: ItemId.make(row.id),
});

const fromItem = (item: Item) => {
  const { title, ...extraData } = item.data;
  const iso = new Date(item.createdAt.epochMillis).toISOString();
  return {
    createdAt: iso,
    data: extraData as Record<string, unknown>,
    feedId: item.feedId as string,
    id: item.id as string,
    title: title as string,
  };
};

const handleError = (error: unknown) =>
  new AppError({ code: 'INTERNAL_ERROR', message: String(error) });

const makeCreate = (db: SqliteRemoteDatabase) => (item: Item) =>
  Effect.gen(function* () {
    yield* db.insert(items).values(fromItem(item));
    return item;
  }).pipe(Effect.catchAll(handleError));

const makeDelete = (db: SqliteRemoteDatabase) => (ids: ReadonlyArray<ItemId>) =>
  Effect.gen(function* () {
    yield* db.delete(items).where(inArray(items.id, [...ids]));
  }).pipe(Effect.catchAll(handleError));

const makeFindByFeedId = (db: SqliteRemoteDatabase) => (feedId: FeedId) =>
  Effect.gen(function* () {
    const rows = yield* db.select().from(items).where(eq(items.feedId, feedId));
    return rows.map(toItem);
  }).pipe(Effect.catchAll(handleError));

const makeFindById = (db: SqliteRemoteDatabase) => (id: ItemId) =>
  Effect.gen(function* () {
    const rows = yield* db.select().from(items).where(eq(items.id, id));
    return rows.length > 0 ? Option.some(toItem(rows[0])) : Option.none();
  }).pipe(Effect.catchAll(handleError));

export const createItemRepository = (db: SqliteRemoteDatabase): IItemRepository => ({
  create: makeCreate(db),
  delete: makeDelete(db),
  findByFeedId: makeFindByFeedId(db),
  findById: makeFindById(db),
});

export const ItemRepositoryLive = Layer.effect(
  ItemRepository,
  Effect.gen(function* () {
    const db = yield* SqliteDrizzle.SqliteDrizzle;
    return createItemRepository(db);
  })
);
