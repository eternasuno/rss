import { Context, type Effect } from 'effect';

export interface ICrypto {
  readonly generateUUId: Effect.Effect<string>;
}

export class Crypto extends Context.Tag('Crypto')<Crypto, ICrypto>() {}
