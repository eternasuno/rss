import { randomUUID } from 'node:crypto';
import { Effect, Layer } from 'effect';
import { Crypto } from '../core/port';

export const CryptoLive = Layer.succeed(Crypto, {
  generateUUId: () => Effect.sync(randomUUID),
});
