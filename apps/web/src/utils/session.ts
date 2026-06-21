import { useSession } from '@tanstack/solid-start/server';

type SessionData = {
  userId?: string;
  email?: string;
};

export const getSession = () =>
  useSession<SessionData>({
    name: 'rss-session',
    password: process.env.SESSION_SECRET || 'dev-secret-change-me-in-production',
    cookie: {
      secure: false,
      sameSite: 'lax',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  });
