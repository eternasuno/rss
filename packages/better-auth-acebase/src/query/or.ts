import type { AdapterContext } from '../adapter-context';
import { findManyWithAnd, findOneWithAnd } from './and';
import type { FilterClause } from './filter';
import { buildFilterQuery, splitByOrClause } from './filter';

const deduplicateById = <T extends Record<string, unknown>>(items: T[]): T[] => {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    const id = item.id as string;
    if (!seen.has(id)) {
      seen.add(id);
      result.push(item);
    }
  }
  return result;
};

export const findOneWithOr = async <T>(args: {
  context: AdapterContext;
  model: string;
  where: FilterClause[];
}): Promise<T | null> => {
  const { context, model, where } = args;
  const groups = splitByOrClause(where);
  for (const group of groups) {
    const found = await findOneWithAnd<T>({ context, model, where: group });
    if (found) {
      return found;
    }
  }
  return null;
};

export const findManyWithOr = async <T>(args: {
  context: AdapterContext;
  model: string;
  where: FilterClause[];
  limit: number;
  sortBy?: { field: string; direction: 'asc' | 'desc' };
  offset?: number;
}): Promise<T[]> => {
  const { context, model, where, limit, sortBy, offset } = args;
  const groups = splitByOrClause(where);
  const allResults = await Promise.all(
    groups.map((g) => findManyWithAnd<T>({ context, limit, model, offset, sortBy, where: g }))
  );
  const flat = allResults.flat();
  return deduplicateById(flat as unknown as Record<string, unknown>[]) as unknown as T[];
};

export const countWithOr = async (args: {
  context: AdapterContext;
  model: string;
  where: FilterClause[];
}): Promise<number> => {
  const { context, model, where } = args;
  const groups = splitByOrClause(where);
  const deduped = new Set<string>();
  for (const group of groups) {
    const snapshots = await buildFilterQuery({
      query: context.db.query(model),
      where: group,
    }).get();
    const values = snapshots.getValues() as Array<Record<string, unknown>>;
    for (const val of values) {
      deduped.add(val.id as string);
    }
  }
  return deduped.size;
};
