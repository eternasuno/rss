import type { AdapterContext } from '../adapter-context';
import { decodeCollectionMarkers, decodeMarkerFromRecord } from '../null-polyfill';
import { executeFindMany, executeFindOne } from '../query/dispatch';
import type { FilterClause } from '../query/filter';
import { buildFilterQuery, hasOrClause } from '../query/filter';
import type { JoinConfig } from '../query/join';
import { attachJoins, attachJoinsToRecord } from '../query/join';
import { countWithOr } from '../query/or';
import { createFieldMapper, selectFields } from '../query/projection';

export const makeFindOne = (context: AdapterContext) => {
  return async <T extends Record<string, unknown>>(args: {
    model: string;
    where: FilterClause[];
    select?: string[];
    join?: JoinConfig;
  }): Promise<T | null> => {
    await context.initPromise;
    const record = (await executeFindOne({
      context,
      model: args.model,
      where: args.where,
    })) as T | null;
    const restored = decodeMarkerFromRecord(record);
    if (args.join && Object.keys(args.join).length > 0) {
      return attachJoinsToRecord({
        context,
        join: args.join as JoinConfig,
        record: restored as T | null,
      });
    }
    return restored as T | null;
  };
};

export const makeCount = (context: AdapterContext) => {
  return async (args: { model: string; where?: FilterClause[] }): Promise<number> => {
    await context.initPromise;
    const { where, model } = args;
    if (!where?.length) {
      return context.db.ref(model).count();
    }
    if (hasOrClause(where)) {
      return countWithOr({ context, model, where });
    }
    return buildFilterQuery({
      query: context.db.query(model),
      where,
    }).count();
  };
};

const processManyResults = async <T extends Record<string, unknown>>(args: {
  context: AdapterContext;
  model: string;
  records: T[];
  join?: JoinConfig;
  select?: string[];
}): Promise<T[]> => {
  let result = args.records;
  if (args.join && Object.keys(args.join).length > 0) {
    result = await attachJoins({
      context: args.context,
      join: args.join as JoinConfig,
      records: result,
    });
  }
  if (args.select && args.select.length > 0) {
    result = selectFields({
      mapFieldName: createFieldMapper({
        context: args.context,
        model: args.model,
      }),
      records: result as Record<string, unknown>[],
      select: args.select as string[],
    }) as unknown as T[];
  }
  return result;
};

export const makeFindMany = (context: AdapterContext) => {
  return async <T extends Record<string, unknown>>(args: {
    model: string;
    where?: FilterClause[];
    limit: number;
    sortBy?: { field: string; direction: 'asc' | 'desc' };
    offset?: number;
    select?: string[];
    join?: JoinConfig;
  }): Promise<T[]> => {
    await context.initPromise;
    const records = decodeCollectionMarkers(
      (await executeFindMany<T>({
        context,
        ...args,
      })) as Record<string, unknown>[]
    ) as T[];
    return processManyResults<T>({
      context,
      join: args.join,
      model: args.model,
      records,
      select: args.select,
    });
  };
};
