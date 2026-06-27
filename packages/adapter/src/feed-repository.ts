import { type Feed, type FeedData, FeedId, UserId } from '@rss/core/entity';
import { AppError, FeedRepository } from '@rss/core/port';
import { DB, Schema } from '@rss/infrastructure-sqlite/db';
import { eq, inArray } from 'drizzle-orm';
import { DateTime, Effect, Layer, Option, pipe } from 'effect';

const fromDBSchema = (row: typeof Schema.feeds.$inferSelect): Feed => ({
  createdAt: DateTime.unsafeMake(row.createdAt),
  data: {
    ...row.extraData,
    description: row.description,
    link: new URL(row.link),
    title: row.title,
  } as FeedData,
  id: FeedId.make(row.id),
  userId: UserId.make(row.userId),
});

const toDBSchema = (feed: Feed): typeof Schema.feeds.$inferInsert => {
  const { description, link, title, ...extraData } = feed.data;

  return {
    createdAt: DateTime.toDate(feed.createdAt),
    description,
    extraData,
    id: feed.id,
    link: link.toString(),
    title: title,
    userId: feed.userId,
  };
};

const catchError = Effect.catchAll(
  (error) => new AppError({ code: 'INTERNAL_ERROR', message: String(error) })
);

export const FeedRepositoryLive = Layer.effect(
  FeedRepository,
  // biome-ignore lint/complexity/noExcessiveLinesPerFunction: layer definition
  Effect.gen(function* () {
    const db = yield* DB;

    return {
      create: (feed) =>
        pipe(
          db.insert(Schema.feeds).values(toDBSchema(feed)),
          catchError,
          Effect.map(() => feed)
        ),

      delete: (ids) =>
        pipe(db.delete(Schema.feeds).where(inArray(Schema.feeds.id, ids)), catchError),

      findById: (id) =>
        pipe(
          db.select().from(Schema.feeds).where(eq(Schema.feeds.id, id)),
          catchError,
          Effect.map((rows) => Option.map(Option.fromNullable(rows.at(0)), fromDBSchema))
        ),

      findByUserId: (userId) =>
        pipe(
          db.select().from(Schema.feeds).where(eq(Schema.feeds.userId, userId)),
          catchError,
          Effect.map((rows) => rows.map(fromDBSchema))
        ),

      update:
        (id) =>
        ({ title, description, link, ...extraData }) =>
          pipe(
            db
              .update(Schema.feeds)
              .set({ description, extraData, link: link?.toString(), title })
              .where(eq(Schema.feeds.id, id)),
            catchError
          ),
    };
  })
);
