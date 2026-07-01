import path from 'node:path';
import { defineConfig, mergeRsbuildConfig } from '@rsbuild/core';
import  clientConfig  from './apps/client/rsbuild.config';

export default defineConfig({
  environments: {
    api: {
      output: {
        distPath: {
          root: path.resolve(import.meta.dirname, './dist'),
        },
        target: 'node',
      },
      source: {
        entry: {
          index: path.resolve(import.meta.dirname, './apps/api/src/index.ts'),
        },
      },
    },
    client: mergeRsbuildConfig(clientConfig, {
      output: {
        distPath: {
          root: path.resolve(import.meta.dirname, './dist/public'),
        },
        target: 'web',
      },
      server: {},
    }),
  },
});
