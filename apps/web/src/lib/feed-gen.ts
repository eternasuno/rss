import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';

const getFeedsDir = (): string => {
  const feedsDir = path.join(process.cwd(), 'data', 'feeds');
  if (!existsSync(feedsDir)) {
    mkdirSync(feedsDir, { recursive: true });
  }
  return feedsDir;
};

export const writeFeedFile = ({ feedId, xml }: { feedId: string; xml: string }): void => {
  writeFileSync(path.join(getFeedsDir(), `${feedId}.xml`), xml, 'utf-8');
};

export const readFeedFile = ({ feedId }: { feedId: string }): string | null => {
  const filePath = path.join(getFeedsDir(), `${feedId}.xml`);
  if (!existsSync(filePath)) return null;
  return readFileSync(filePath, 'utf-8');
};
