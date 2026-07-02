import type { AdapterContext } from '../adapter-context';
import { encodeNullToMarker } from '../null-polyfill';

export const makeCreate = (context: AdapterContext) => {
  return async <T extends Record<string, unknown>>(args: {
    model: string;
    data: T;
  }): Promise<T> => {
    await context.initPromise;
    const stored = encodeNullToMarker(args.data);
    await context.db.ref(`${args.model}/${stored.id}`).set(stored);
    return args.data;
  };
};
