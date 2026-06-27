import { Effect, Layer } from 'effect';
import { FeedGenerator, type IFeedGenerator } from '../../src/port/feed-generator';

const XML_OUTPUT =
  '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Test</title></channel></rss>';

const mockFeedGenerator: IFeedGenerator = {
  generateFeedXml: () => Effect.succeed(XML_OUTPUT),
};

export const FeedGeneratorTest = Layer.succeed(FeedGenerator, mockFeedGenerator);
