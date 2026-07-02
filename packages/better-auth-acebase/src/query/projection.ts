import type { AdapterContext } from '../adapter-context';

export const createFieldMapper = (args: {
  context: AdapterContext;
  model: string;
}): ((f: string) => string) => {
  return (f: string) =>
    args.context.getFieldName ? args.context.getFieldName({ field: f, model: args.model }) : f;
};

export const selectFields = (args: {
  records: Record<string, unknown>[];
  select: string[];
  mapFieldName: (field: string) => string;
}): Record<string, unknown>[] => {
  const physicalNames = args.select.map(args.mapFieldName);
  return args.records.map((r) => {
    const obj: Record<string, unknown> = {};
    for (const name of physicalNames) {
      if (name in r) {
        obj[name] = r[name];
      }
    }
    return obj;
  });
};
