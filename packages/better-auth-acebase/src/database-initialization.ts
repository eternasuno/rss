import type { AceBase } from 'acebase';

export const DEFAULT_INDEXES: Array<{ model: string; fields: string[] }> = [
  { fields: ['email'], model: 'user' },
  { fields: ['token', 'userId', 'expiresAt'], model: 'session' },
  { fields: ['providerId', 'accountId', 'userId'], model: 'account' },
  { fields: ['identifier'], model: 'verification' },
  { fields: ['key'], model: 'rateLimit' },
];

export const ensureIndexes = async (args: {
  db: AceBase;
  getModelName: (model: string) => string;
}): Promise<void> => {
  await args.db.ready();
  for (const { model, fields } of DEFAULT_INDEXES) {
    let physicalName: string;
    try {
      physicalName = args.getModelName(model);
    } catch {
      continue;
    }
    for (const field of fields) {
      // Ignore errors for idempotent index creation (e.g. index already exists)
      await args.db.indexes.create(physicalName, field).catch(() => {});
    }
  }
};
