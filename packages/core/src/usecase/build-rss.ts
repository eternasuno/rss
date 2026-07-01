import { Effect } from 'effect';
import type { FeedId } from '../entity/feed';
import { XMLBuilder } from '../port/xml-builder';
import { getFeed } from './get-feed';

export const generateXML = (feedId: FeedId) =>
  Effect.gen(function* () {
    const xmlBuilder = yield* XMLBuilder;

    const data = yield* getFeed(feedId);
    const xml = yield* xmlBuilder.buildRSS(data);

    return xml;
  });
