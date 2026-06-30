import { defineConfig } from '@rsbuild/core';
import { pluginBabel } from '@rsbuild/plugin-babel';
import { pluginSolid } from '@rsbuild/plugin-solid';
import { pluginTailwindcss } from '@rsbuild/plugin-tailwindcss';
import path from 'node:path';

export const frontendBaseConfig = defineConfig({
  plugins: [
    pluginBabel({
      include: /\.(?:jsx|tsx)$/,
    }),
    pluginSolid(),
    pluginTailwindcss(),
  ],
  source: {
    entry: {
      index: path.resolve(import.meta.dirname, './src/index.tsx'),
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
      '/rss': 'http://localhost:3001',
    },
  },
});

export default frontendBaseConfig;
