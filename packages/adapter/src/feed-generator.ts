import { AppError, FeedGenerator } from '@rss/core/port';
import { Effect, Layer } from 'effect';
import { generateRssFeed } from 'feedsmith';

export const FeedGeneratorLive = Layer.succeed(FeedGenerator, {
  generateFeedXml: ({ feed, items }) =>
    Effect.try({
      catch: (error) =>
        new AppError({
          code: 'FEED_GENERATION_ERROR',
          message: `Failed to generate feed XML: ${String(error)}`,
        }),
      try: () =>
        generateRssFeed({
          ...feed.data,
          items: items.map((item) => ({
            ...item.data,
            guid: { isPermaLink: false, value: item.id },
          })),
          link: feed.data.link.toString(),
        }),
    }),
});
