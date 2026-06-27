import type { Server } from 'vike/types';
import { app } from './hono';

export default {
  fetch: app.fetch,
  prod: {
    port: 5100,
  },
} satisfies Server;
