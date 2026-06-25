import type { Feed, Item } from '@rss/core/entity';
import { AppError, FeedGenerator, type IFeedGenerator } from '@rss/core/port';
import { Effect, Layer } from 'effect';
import { generateRssFeed } from 'feedsmith';

const generateFeedXml = ({
  feed,
  items,
}: {
  readonly feed: Feed;
  readonly items: ReadonlyArray<Item>;
}): Effect.Effect<string, AppError> =>
  Effect.try({
    catch: (error) =>
      new AppError({
        code: 'FEED_GENERATION_ERROR',
        message: `Failed to generate feed XML: ${String(error)}`,
      }),
    try: () =>
      generateRssFeed({
        ...feed.data,
        items: items.map((item) => item.data),
        link: feed.data.link.toString(),
      }),
  });

export const FeedsmithGenerator: IFeedGenerator = {
  generateFeedXml,
};

export const FeedsmithGeneratorLayer = Layer.succeed(FeedGenerator, FeedsmithGenerator);
