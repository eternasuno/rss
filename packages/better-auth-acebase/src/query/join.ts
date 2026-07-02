import type { AdapterContext } from '../adapter-context';

export type JoinConfig = Record<
  string,
  {
    on: { from: string; to: string };
    limit?: number;
    relation?: 'one-to-one' | 'one-to-many' | 'many-to-many';
  }
>;

const attachJoinModel = async <T extends Record<string, unknown>>(args: {
  context: AdapterContext;
  records: T[];
  joinModel: string;
  config: JoinConfig[string];
}): Promise<void> => {
  const { context, records, joinModel, config } = args;
  const foreignKeys = [...new Set(records.map((r) => r[config.on.to] as string))];
  const joinRefs = await context.db
    .query(joinModel)
    .filter(config.on.from, 'in', foreignKeys)
    .get();
  const joinValues = joinRefs.getValues() as Array<Record<string, unknown>>;
  const byFk = new Map<string, Array<Record<string, unknown>>>();
  for (const jv of joinValues) {
    const key = jv[config.on.from] as string;
    if (!byFk.has(key)) {
      byFk.set(key, []);
    }
    byFk.get(key)?.push(jv);
  }

  for (const record of records) {
    const r = record as Record<string, unknown>;
    const matches = byFk.get(r[config.on.to] as string) ?? [];
    r[joinModel] = config.relation === 'one-to-one' ? (matches[0] ?? null) : matches;
  }
};

export const attachJoins = async <T extends Record<string, unknown>>(args: {
  context: AdapterContext;
  records: T[];
  join: JoinConfig;
}): Promise<T[]> => {
  const { context, records, join } = args;
  if (!records.length) {
    return records;
  }

  for (const [joinModel, joinConfig] of Object.entries(join)) {
    await attachJoinModel({
      config: joinConfig as JoinConfig[string],
      context,
      joinModel,
      records,
    });
  }

  return records;
};

export const attachJoinsToRecord = async <T extends Record<string, unknown>>(args: {
  context: AdapterContext;
  record: T | null;
  join: JoinConfig;
}): Promise<T | null> => {
  const { context, record, join } = args;
  if (!record) {
    return null;
  }

  const records = await attachJoins({ context, join, records: [record] });
  return records[0] ?? null;
};
