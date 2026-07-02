import type { AdapterContext } from '../adapter-context';
import { deleteManyWithAnd, findManyWithAnd, findOneWithAnd, updateManyWithAnd } from './and';
import type { FilterClause } from './filter';
import { hasOrClause, splitByOrClause } from './filter';
import { findManyWithOr, findOneWithOr } from './or';

export const executeFindMany = async <T>(args: {
  context: AdapterContext;
  model: string;
  where?: FilterClause[];
  limit: number;
  sortBy?: { field: string; direction: 'asc' | 'desc' };
  offset?: number;
}): Promise<T[]> => {
  const { context } = args;
  const needsOr = args.where && args.where.length > 0 && hasOrClause(args.where);
  if (needsOr) {
    return findManyWithOr<T>({
      context,
      limit: args.limit,
      model: args.model,
      offset: args.offset,
      sortBy: args.sortBy,
      where: args.where as FilterClause[],
    });
  }
  return findManyWithAnd<T>({
    context,
    limit: args.limit,
    model: args.model,
    offset: args.offset,
    sortBy: args.sortBy,
    where: args.where ?? [],
  });
};

export const executeFindOne = async (args: {
  context: AdapterContext;
  model: string;
  where: FilterClause[];
}): Promise<Record<string, unknown> | null> => {
  const { context, model, where } = args;
  const needsOr = hasOrClause(where);
  return needsOr
    ? findOneWithOr<Record<string, unknown>>({ context, model, where })
    : findOneWithAnd<Record<string, unknown>>({ context, model, where });
};

export const executeUpdateMany = async (args: {
  context: AdapterContext;
  model: string;
  where: FilterClause[];
  update: Record<string, unknown>;
}): Promise<number> => {
  const { context } = args;
  if (hasOrClause(args.where)) {
    const groups = splitByOrClause(args.where);
    let total = 0;
    for (const group of groups) {
      total += await updateManyWithAnd({
        context,
        model: args.model,
        update: args.update,
        where: group,
      });
    }
    return total;
  }
  return updateManyWithAnd({
    context,
    model: args.model,
    update: args.update,
    where: args.where,
  });
};

export const executeDeleteMany = async (args: {
  context: AdapterContext;
  model: string;
  where: FilterClause[];
}): Promise<number> => {
  const { context } = args;
  if (hasOrClause(args.where)) {
    const groups = splitByOrClause(args.where);
    let total = 0;
    for (const group of groups) {
      total += await deleteManyWithAnd({
        context,
        model: args.model,
        where: group,
      });
    }
    return total;
  }
  return deleteManyWithAnd({
    context,
    model: args.model,
    where: args.where,
  });
};
