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
      if (!user || !verifyPassword({ password, hash: user.passwordHash })) {
        return { success: false, error: 'Invalid email or password' };
      }
      const session = await getSession();
      await session.update({ userId: user.id, email: user.email });
      return { success: true, data: { email: user.email } };
    } catch (err) {
      return { success: false, error: 'Server error' };
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
        return { success: false, error: 'Email already registered' };
      }
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      db.insert(users).values({
        id,
        email,
        passwordHash: hashPassword({ password }),
        createdAt: now,
      }).run();
      const apiKeyId = crypto.randomUUID();
      const apiKeyValue = generateToken();
      db.insert(apiKeys).values({
        id: apiKeyId,
        userId: id,
        key: apiKeyValue,
        createdAt: now,
      }).run();
      const session = await getSession();
      await session.update({ userId: id, email });
      return { success: true, data: { email, apiKey: apiKeyValue } };
    } catch (err) {
      return { success: false, error: 'Server error' };
    }
  });
