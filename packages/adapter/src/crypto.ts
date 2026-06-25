import { randomUUID } from 'node:crypto';
import { Crypto, type ICrypto } from '@rss/core/port';
import { Effect, Layer } from 'effect';

const generateUUId = (): Effect.Effect<string> => Effect.sync(() => randomUUID());

export const UuidCrypto: ICrypto = {
  generateUUId,
};

export const UuidCryptoLayer = Layer.succeed(Crypto, UuidCrypto);
