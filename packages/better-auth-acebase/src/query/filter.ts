import { NULL_MARKER } from '../null-polyfill';

export type FilterClause = {
  operator: string;
  value: unknown;
  field: string;
  connector: 'AND' | 'OR';
  mode: 'sensitive' | 'insensitive';
};

type ResolvedFilter = {
  op: string;
  val: unknown;
};

type OperatorHandler = (value: unknown) => ResolvedFilter;

type OperatorEntry = {
  sensitive: OperatorHandler;
  insensitive?: OperatorHandler;
  nullHandler?: () => ResolvedFilter;
};

const escapeRegExp = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const makeInsensitiveEq = (value: unknown): ResolvedFilter => {
  return { op: 'matches', val: new RegExp(`^${escapeRegExp(String(value))}$`, 'i') };
};

const makeInsensitiveNe = (value: unknown): ResolvedFilter => {
  return { op: '!matches', val: new RegExp(`^${escapeRegExp(String(value))}$`, 'i') };
};

const makeInsensitiveContains = (value: unknown): ResolvedFilter => {
  return { op: 'matches', val: new RegExp(escapeRegExp(String(value)), 'i') };
};

const makeInsensitiveStartsWith = (value: unknown): ResolvedFilter => {
  return { op: 'matches', val: new RegExp(`^${escapeRegExp(String(value))}`, 'i') };
};

const makeInsensitiveEndsWith = (value: unknown): ResolvedFilter => {
  return { op: 'matches', val: new RegExp(`${escapeRegExp(String(value))}$`, 'i') };
};

const operatorTable: Record<string, OperatorEntry> = {
  contains: {
    insensitive: makeInsensitiveContains,
    sensitive: (v) => ({ op: 'like', val: `*${v}*` }),
  },
  ends_with: {
    insensitive: makeInsensitiveEndsWith,
    sensitive: (v) => ({ op: 'like', val: `*${v}` }),
  },
  eq: {
    insensitive: makeInsensitiveEq,
    nullHandler: () => ({ op: '==', val: null }),
    sensitive: (v) => ({ op: '==', val: v }),
  },
  gt: { sensitive: (v) => ({ op: '>', val: v }) },
  gte: { sensitive: (v) => ({ op: '>=', val: v }) },
  in: { sensitive: (v) => ({ op: 'in', val: v }) },
  lt: { sensitive: (v) => ({ op: '<', val: v }) },
  lte: { sensitive: (v) => ({ op: '<=', val: v }) },
  ne: {
    insensitive: makeInsensitiveNe,
    nullHandler: () => ({ op: '!=', val: null }),
    sensitive: (v) => ({ op: '!=', val: v }),
  },
  not_in: { sensitive: (v) => ({ op: '!in', val: v }) },
  starts_with: {
    insensitive: makeInsensitiveStartsWith,
    sensitive: (v) => ({ op: 'like', val: `${v}*` }),
  },
};

export const resolveFilter = (clause: FilterClause): ResolvedFilter => {
  const { operator, mode, value } = clause;
  const entry = operatorTable[operator];
  if (!entry) {
    return { op: '==', val: value };
  }
  if (value === null && entry.nullHandler) {
    return entry.nullHandler();
  }
  const useInsensitive = mode === 'insensitive' && typeof value === 'string';
  if (useInsensitive && entry.insensitive) {
    return entry.insensitive(value);
  }
  return entry.sensitive(value);
};

// biome-ignore lint/suspicious/noExplicitAny: AceBase query type not publicly exported
export const applyFilterToQuery = (args: { query: any; clause: FilterClause }): any => {
  const resolved = resolveFilter(args.clause);
  const val = resolved.val === null ? NULL_MARKER : resolved.val;
  return args.query.filter(args.clause.field, resolved.op, val);
};

// biome-ignore lint/suspicious/noExplicitAny: AceBase query type not publicly exported
export const buildFilterQuery = (args: { query: any; where: FilterClause[] }): any => {
  let { query, where } = args;
  for (const clause of where) {
    query = applyFilterToQuery({ clause, query });
  }
  return query;
};

export const hasOrClause = (where: FilterClause[]): boolean => {
  return where.some((c) => c.connector === 'OR');
};

export const splitByOrClause = (where: FilterClause[]): FilterClause[][] => {
  const groups: FilterClause[][] = [];
  let current: FilterClause[] = [];
  for (const clause of where) {
    if (clause.connector === 'OR' && current.length > 0) {
      groups.push(current);
      current = [];
    }
    current.push(clause);
  }
  if (current.length > 0) {
    groups.push(current);
  }
  return groups;
};
