import { Context, type Effect } from 'effect';
import type { Feed } from '../entity/feed';
import type { Item } from '../entity/item';
import type { AppError } from './app-error';

export interface IXMLBuilder {
  readonly buildRSS: (params: {
    readonly feed: Feed;
    readonly items: ReadonlyArray<Item>;
  }) => Effect.Effect<string, AppError, never>;
}

export class XMLBuilder extends Context.Tag('XMLBuilder')<XMLBuilder, IXMLBuilder>() {}
