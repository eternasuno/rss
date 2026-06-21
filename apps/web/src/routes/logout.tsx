import { createFileRoute, redirect } from '@tanstack/solid-router';
import { logoutFn } from '../server/auth';

export const Route = createFileRoute('/logout')({
  loader: async () => {
    await logoutFn();
    throw redirect({ to: '/login' });
  },
});
