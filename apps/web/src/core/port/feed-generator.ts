import { Context, type Effect } from 'effect';
import type { Feed } from '../entity/feed';
import type { Item } from '../entity/item';
import type { AppError } from './app-error';

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
