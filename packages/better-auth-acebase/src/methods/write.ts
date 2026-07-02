import type { AdapterContext } from '../adapter-context';
import { decodeMarkerFromRecord, encodeNullToMarker } from '../null-polyfill';
import { executeDeleteMany, executeFindOne, executeUpdateMany } from '../query/dispatch';
import type { FilterClause } from '../query/filter';

const updateOneRecord = async <T extends Record<string, unknown>>(args: {
  context: AdapterContext;
  model: string;
  where: FilterClause[];
  update: Record<string, unknown>;
}): Promise<T | null> => {
  const record = await executeFindOne({
    context: args.context,
    model: args.model,
    where: args.where,
  });
  if (!record) {
    return null;
  }

  const id = record.id as string;
  const prepared = encodeNullToMarker(args.update as Record<string, unknown>);
  await args.context.db.ref(`${args.model}/${id}`).update(prepared);
  const updated = await args.context.db.ref(`${args.model}/${id}`).get();
  return decodeMarkerFromRecord(updated.val() as T | null) as T | null;
};

export const makeUpdate = (context: AdapterContext) => {
  return async <T extends Record<string, unknown>>(args: {
    model: string;
    where: FilterClause[];
    update: Record<string, unknown>;
  }): Promise<T | null> => {
    await context.initPromise;
    if (args.where.length === 0) {
      return null;
    }
    return updateOneRecord<T>({ context, ...args });
  };
};

export const makeUpdateMany = (context: AdapterContext) => {
  return async (args: {
    model: string;
    where: FilterClause[];
    update: Record<string, unknown>;
  }): Promise<number> => {
    await context.initPromise;
    return executeUpdateMany({ context, ...args });
  };
};

export const makeDelete = (context: AdapterContext) => {
  return async (args: { model: string; where: FilterClause[] }): Promise<void> => {
    await context.initPromise;
    const record = await executeFindOne({
      context,
      model: args.model,
      where: args.where,
    });
    if (!record) {
      return;
    }

    await context.db.ref(`${args.model}/${record.id as string}`).remove();
  };
};

export const makeDeleteMany = (context: AdapterContext) => {
  return async (args: { model: string; where: FilterClause[] }): Promise<number> => {
    await context.initPromise;
    return executeDeleteMany({ context, ...args });
  };
};
