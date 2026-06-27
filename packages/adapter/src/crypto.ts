import { randomUUID } from 'node:crypto';
import { Crypto } from '@rss/core/port';
import { Effect, Layer } from 'effect';

export const CryptoLive = Layer.succeed(Crypto, {
  generateUUId: () => Effect.sync(randomUUID),
});
