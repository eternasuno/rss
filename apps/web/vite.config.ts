import { solidStart } from '@solidjs/start/config';
import { nitroV2Plugin as nitro } from '@solidjs/vite-plugin-nitro-2';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    plugins: [solidStart(), tailwindcss(), nitro()],
    ssr: { external: ['drizzle-orm'] },
  };
});
