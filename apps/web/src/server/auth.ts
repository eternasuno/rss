import { createServerFn } from '@tanstack/solid-start';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { apiKeys, users } from '../db/schema';
import { generateToken, hashPassword, verifyPassword } from '../lib/auth';
import { getSession } from '../utils/session';

export type LoginInput = {
  email: string;
  password: string;
};

export const loginFn = createServerFn({ method: 'POST' })
  .validator((d: LoginInput) => d)
  .handler(async ({ data: { email, password } }) => {
    try {
      const user = db.select().from(users).where(eq(users.email, email)).get();
      if (!user || !verifyPassword({ hash: user.passwordHash, password })) {
        return { error: 'Invalid email or password', success: false };
      }
      const session = await getSession();
      await session.update({ email: user.email, userId: user.id });
      return { data: { email: user.email }, success: true };
    } catch (err) {
      return { error: 'Server error', success: false };
    }
  });

export const logoutFn = createServerFn({ method: 'POST' }).handler(async () => {
  const session = await getSession();
  await session.clear();
  return { success: true };
});

export const getCurrentUser = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const session = await getSession();
    const userId = session.get('userId');
    if (!userId) return null;
    const user = db.select().from(users).where(eq(users.id, userId)).get();
    if (!user) return null;
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  } catch {
    return null;
  }
});

export const registerFn = createServerFn({ method: 'POST' })
  .validator((d: LoginInput) => d)
  .handler(async ({ data: { email, password } }) => {
    try {
      const existing = db.select().from(users).where(eq(users.email, email)).get();
      if (existing) {
        return { error: 'Email already registered', success: false };
      }
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      db.insert(users)
        .values({
          createdAt: now,
          email,
          id,
          passwordHash: hashPassword({ password }),
        })
        .run();
      const apiKeyId = crypto.randomUUID();
      const apiKeyValue = generateToken();
      db.insert(apiKeys)
        .values({
          createdAt: now,
          id: apiKeyId,
          key: apiKeyValue,
          userId: id,
        })
        .run();
      const session = await getSession();
      await session.update({ email, userId: id });
      return { data: { apiKey: apiKeyValue, email }, success: true };
    } catch (err) {
      return { error: 'Server error', success: false };
    }
  });
