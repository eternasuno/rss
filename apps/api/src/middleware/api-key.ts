import type { Context, Next } from 'hono';

import { auth } from '../auth';
import { AppError } from '../lib/app-error';

export async function dualAuthMiddleware(c: Context, next: Next) {
  const apiKey = c.req.header('x-api-key');

  if (apiKey) {
    // API key auth path
    const result = await auth.api.verifyApiKey({
      body: { key: apiKey },
    });

    if (!result.valid || !result.key) {
      throw AppError.unauthorized('Invalid or expired API key');
    }

    // referenceId is the userId when references: "user" (default)
    c.set('userId', result.key.referenceId);
  } else {
    // Session auth path (fallback for frontend SPA)
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
      throw AppError.unauthorized();
    }
    c.set('userId', session.user.id);
  }

  await next();
}
