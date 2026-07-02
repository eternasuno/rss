import type { AceBase } from 'acebase';
import type { BetterAuthOptions } from 'better-auth';
import { type AdapterFactory, createAdapterFactory } from 'better-auth/adapters';
import { createAdapterMethods } from './methods';

export type AceBaseAdapterConfig = {
  db: AceBase;
  usePlural?: boolean;
  debugLogs?: boolean;
};

export const acebaseAdapter = (
  config: AceBaseAdapterConfig
): AdapterFactory<BetterAuthOptions> => {
  const factoryConfig = {
    adapterId: 'acebase' as const,
    adapterName: 'AceBase Adapter',
    debugLogs: config.debugLogs ?? false,
    supportsDates: false,
    supportsJSON: true,
    supportsNumericIds: false,
    supportsUUIDs: false,
    usePlural: config.usePlural ?? false,
  };
  return createAdapterFactory({
    adapter: createAdapterMethods(config.db),
    config: factoryConfig,
  });
};
