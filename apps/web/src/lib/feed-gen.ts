import { generateRssFeed } from 'feedsmith';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import * as path from 'node:path';
import type { Feed, Item } from '@rss/shared';

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
    title: feed.title,
    link: feed.link,
    description: feed.description,
    language: (feed.data.language as string) || 'en',
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
