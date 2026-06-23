import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';
import type { Feed, Item } from '@rss/shared';
import { generateRssFeed } from 'feedsmith';

let feedsDir: string | null = null;

const getFeedsDir = (): string => {
  if (!feedsDir) {
    feedsDir = path.join(process.cwd(), 'data', 'feeds');
    if (!existsSync(feedsDir)) {
      mkdirSync(feedsDir, { recursive: true });
    }
  }
  return feedsDir;
};

export type RssGenParams = {
  feed: Feed;
  items: Item[];
};

export const generateFeedXml = ({ feed, items }: RssGenParams): string =>
  generateRssFeed({
    description: feed.description,
    language: (feed.data.language as string) || 'en',
    link: feed.link,
    title: feed.title,
    ...feed.data,
    items: items.map((item) => ({
      title: item.title,
      ...item.data,
    })),
  });

export const writeFeedFile = ({ feedId, xml }: { feedId: string; xml: string }): void => {
  writeFileSync(path.join(getFeedsDir(), `${feedId}.xml`), xml, 'utf-8');
};

export const readFeedFile = ({ feedId }: { feedId: string }): string | null => {
  const filePath = path.join(getFeedsDir(), `${feedId}.xml`);
  if (!existsSync(filePath)) return null;
  return readFileSync(filePath, 'utf-8');
};
