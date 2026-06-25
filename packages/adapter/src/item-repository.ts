import { FeedId, type Item, type ItemData, ItemId } from '@rss/core/entity';
import { AppError, type IItemRepository, ItemRepository } from '@rss/core/port';
import { createClient } from '@rss/infrastructure-sqlite/db';
import { items } from '@rss/infrastructure-sqlite/schema';
import { eq, inArray } from 'drizzle-orm';
import { DateTime, Effect, Layer, Option } from 'effect';

type Client = ReturnType<typeof createClient>;
type DbItem = typeof items.$inferSelect;

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

const makeCreate =
  (db: Client) =>
  (item: Item): Effect.Effect<Item, AppError> =>
    Effect.try({
      catch: (error) => new AppError({ code: 'INTERNAL_ERROR', message: String(error) }),
      try: () => {
        db.insert(items).values(fromItem(item)).run();
        return item;
      },
    });

const makeFindById =
  (db: Client) =>
  (id: ItemId): Effect.Effect<Option.Option<Item>, AppError> =>
    Effect.sync(() => {
      const row = db.select().from(items).where(eq(items.id, id)).get();

      if (row) {
        return Option.some(toItem(row));
      }

      return Option.none();
    });

const makeFindByFeedId =
  (db: Client) =>
  (feedId: FeedId): Effect.Effect<ReadonlyArray<Item>, AppError> =>
    Effect.sync(() => db.select().from(items).where(eq(items.feedId, feedId)).all().map(toItem));

const makeDelete =
  (db: Client) =>
  (ids: ReadonlyArray<ItemId>): Effect.Effect<void, AppError> =>
    Effect.sync(() => {
      db.delete(items)
        .where(inArray(items.id, [...ids]))
        .run();
    });

export const createItemRepository = (dbOrPath?: Client | string): IItemRepository => {
  const db =
    dbOrPath === undefined || typeof dbOrPath === 'string' ? createClient(dbOrPath) : dbOrPath;

  return {
    create: makeCreate(db),
    delete: makeDelete(db),
    findByFeedId: makeFindByFeedId(db),
    findById: makeFindById(db),
  };
};

export const SqliteItemRepositoryLayer = (dbPath?: string) =>
  Layer.sync(ItemRepository, () => createItemRepository(dbPath));
