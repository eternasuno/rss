import { Context, type Effect } from 'effect';
import type { Feed } from '../entity/feed.js';
import type { Item } from '../entity/item.js';
import type { AppError } from './app-error.js';

export interface IFeedGenerator {
  readonly generateFeedXml: (params: {
    readonly feed: Feed;
    readonly items: ReadonlyArray<Item>;
  }) => Effect.Effect<string, AppError, never>;
}

export class FeedGenerator extends Context.Tag('FeedGenerator')<
  FeedGenerator,
  IFeedGenerator
>() {}
