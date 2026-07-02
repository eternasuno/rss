import type { AdapterContext } from '../adapter-context';
import type { FilterClause } from './filter';
import { buildFilterQuery } from './filter';

export const findOneWithAnd = async <T>(args: {
  context: AdapterContext;
  model: string;
  where: FilterClause[];
}): Promise<T | null> => {
  const { context, model, where } = args;
  const snapshots = await buildFilterQuery({
    query: context.db.query(model),
    where,
  })
    .take(1)
    .get();
  const values = snapshots.getValues() as T[];
  return values[0] ?? null;
};

export const findManyWithAnd = async <T>(args: {
  context: AdapterContext;
  model: string;
  where: FilterClause[];
  limit: number;
  sortBy?: { field: string; direction: 'asc' | 'desc' };
  offset?: number;
}): Promise<T[]> => {
  const { context, model, where, limit, sortBy, offset } = args;
  let query = context.db.query(model);
  if (where?.length) {
    query = buildFilterQuery({ query, where });
  }

  if (sortBy) {
    query = query.sort(sortBy.field, sortBy.direction === 'asc');
  }

  if (offset) {
    query = query.skip(offset);
  }

  const snapshots = await query.take(limit).get();
  return snapshots.getValues() as T[];
};

export const updateManyWithAnd = async (args: {
  context: AdapterContext;
  model: string;
  where: FilterClause[];
  update: Record<string, unknown>;
}): Promise<number> => {
  const { context, model, where, update } = args;
  const refs = await buildFilterQuery({
    query: context.db.query(model),
    where,
  }).find();
  for (const ref of refs) {
    await ref.update(update);
  }
  return refs.length;
};

export const deleteManyWithAnd = async (args: {
  context: AdapterContext;
  model: string;
  where: FilterClause[];
}): Promise<number> => {
  const { context, model, where } = args;
  const query = buildFilterQuery({ query: context.db.query(model), where });
  const count = await query.count();
  if (count === 0) {
    return 0;
  }

  await query.remove();
  return count;
};
