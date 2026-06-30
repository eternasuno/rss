import type { Context, Next } from 'hono';

import { auth } from '../auth';
import { AppError } from '../lib/app-error';

declare module 'hono' {
  interface ContextVariableMap {
    userId: string;
  }
}

export async function authMiddleware(c: Context, next: Next) {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    throw AppError.unauthorized();
  }
  c.set('userId', session.user.id);
  await next();
}
