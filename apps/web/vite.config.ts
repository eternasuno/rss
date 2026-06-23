import { tanstackStart } from '@tanstack/solid-start/plugin/vite';
import { defineConfig } from 'vite';
import viteSolid from 'vite-plugin-solid';

export default defineConfig({
  plugins: [tanstackStart(), viteSolid({ ssr: true })],
  server: {
    host: '0.0.0.0',
    port: 5100,
  },
});
