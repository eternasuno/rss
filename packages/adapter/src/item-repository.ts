import { FeedId, type Item, type ItemData, ItemId } from '@rss/core/entity';
import { AppError, ItemRepository } from '@rss/core/port';
import { DB, Schema } from '@rss/infrastructure-sqlite/db';
import { eq, inArray } from 'drizzle-orm';
import { DateTime, Effect, Layer, Option, pipe } from 'effect';

const fromDBSchema = (row: typeof Schema.items.$inferSelect): Item => ({
  createdAt: DateTime.unsafeMake(row.createdAt),
  data: {
    ...row.extraData,
    title: row.title,
  } as ItemData,
  feedId: FeedId.make(row.feedId),
  id: ItemId.make(row.id),
});

const toDBSchema = (item: Item): typeof Schema.items.$inferInsert => {
  const { title, ...extraData } = item.data;

  return {
    createdAt: DateTime.toDate(item.createdAt),
    extraData,
    feedId: item.feedId,
    id: item.id,
    title: title,
  };
};

const catchError = Effect.catchAll(
  (error) => new AppError({ code: 'INTERNAL_ERROR', message: String(error) })
);

export const ItemRepositoryLive = Layer.effect(
  ItemRepository,
  // biome-ignore lint/complexity/noExcessiveLinesPerFunction: layer definition
  Effect.gen(function* () {
    const db = yield* DB;

    return {
      create: (item) =>
        pipe(
          db.insert(Schema.items).values(toDBSchema(item)),
          catchError,
          Effect.map(() => item)
        ),

      delete: (ids) =>
        pipe(db.delete(Schema.items).where(inArray(Schema.items.id, ids)), catchError),

      findByFeedId: (feedId) =>
        pipe(
          db.select().from(Schema.items).where(eq(Schema.items.feedId, feedId)),
          catchError,
          Effect.map((rows) => rows.map(fromDBSchema))
        ),

      findById: (id) =>
        pipe(
          db.select().from(Schema.items).where(eq(Schema.items.id, id)),
          catchError,
          Effect.map((rows) => Option.map(Option.fromNullable(rows.at(0)), fromDBSchema))
        ),
    };
  })
);
