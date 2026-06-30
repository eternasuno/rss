import { defineConfig, mergeRsbuildConfig } from '@rsbuild/core';
import path from 'node:path';
import { frontendBaseConfig } from './apps/client/rsbuild.config';

export default defineConfig({
  environments: {
    frontend: mergeRsbuildConfig(frontendBaseConfig, {
      output: {
        target: 'web',
        distPath: {
          root: path.resolve(import.meta.dirname, './dist/public'),
        },
      },
      server: {},
    }),

    backend: {
      source: {
        entry: {
          index: path.resolve(import.meta.dirname, './apps/api/src/index.ts'),
        },
      },
      output: {
        target: 'node',
        distPath: {
          root: path.resolve(import.meta.dirname, './dist'),
        },
        inlineAllScripts: true,
      },
    },
  },
});
