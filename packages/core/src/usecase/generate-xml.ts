import { Effect } from 'effect';
import type { FeedId } from '../entity/feed.js';
import { FeedGenerator } from '../port/feed-generator.js';
import { getFeed } from './get-feed.js';

export const generateXML = (feedId: FeedId) =>
  Effect.gen(function* () {
    const feedGenerator = yield* FeedGenerator;

    const data = yield* getFeed(feedId);
    const xml = yield* feedGenerator.generateFeedXml(data);

    return xml;
  });
