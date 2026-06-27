import { Effect } from 'effect';
import type { FeedId } from '../entity/feed';
import { FeedGenerator } from '../port/feed-generator';
import { getFeed } from './get-feed';

export const generateXML = (feedId: FeedId) =>
  Effect.gen(function* () {
    const feedGenerator = yield* FeedGenerator;

    const data = yield* getFeed(feedId);
    const xml = yield* feedGenerator.generateFeedXml(data);

    return xml;
  });
