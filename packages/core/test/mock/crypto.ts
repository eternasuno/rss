import { Effect, Layer } from 'effect';
import { Crypto, type ICrypto } from '../../src/port/crypto';
import * as cryptoData from './data/crypto';

const mockCrypto: ICrypto = {
  generateUUId: () => Effect.succeed(cryptoData.TEST_UUID),
};

export const CryptoTest = Layer.succeed(Crypto, mockCrypto);
