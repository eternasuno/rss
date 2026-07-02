import type { AceBase } from 'acebase';

export type AdapterContext = {
  initPromise: Promise<void>;
  db: AceBase;
  getFieldName?: (args: { field: string; model: string }) => string;
};
