import { UUIdCryptoLayer } from '@rss/adapter/crypto';
import { FeedsmithGeneratorLayer } from '@rss/adapter/feed-generator';
import { FeedRepositoryLive } from '@rss/adapter/feed-repository';
import { ItemRepositoryLive } from '@rss/adapter/item-repository';
import { DB } from '@rss/infrastructure-sqlite/db';
import { Layer, ManagedRuntime } from 'effect';

const AppLayer: Layer.Layer<unknown, unknown, never> = Layer.mergeAll(
  UUIdCryptoLayer,
  FeedsmithGeneratorLayer,
  FeedRepositoryLive,
  ItemRepositoryLive,
).pipe(Layer.provideMerge(DB.Default)) as unknown as Layer.Layer<unknown, unknown, never>;

export const AppRuntime = ManagedRuntime.make(AppLayer);
