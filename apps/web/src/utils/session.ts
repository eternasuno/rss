import { useSession } from '@tanstack/solid-start/server';

type SessionData = {
  userId?: string;
  email?: string;
};

export const getSession = () =>
  useSession<SessionData>({
    cookie: {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
      secure: false,
    },
    name: 'rss-session',
    password: process.env.SESSION_SECRET || 'dev-secret-change-me-in-production',
  });
