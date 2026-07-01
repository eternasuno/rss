import path from 'node:path';
import { defineConfig } from '@rsbuild/core';
import { pluginBabel } from '@rsbuild/plugin-babel';
import { pluginSolid } from '@rsbuild/plugin-solid';
import { pluginTailwindcss } from '@rsbuild/plugin-tailwindcss';

export default defineConfig({
  plugins: [
    pluginBabel({
      include: /\.(?:jsx|tsx)$/,
    }),
    pluginSolid(),
    pluginTailwindcss(),
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
      '/rss': 'http://localhost:3000',
    },
  },
  source: {
    entry: {
      index: path.resolve(import.meta.dirname, './src/index.tsx'),
    },
  },
});
