import { createFileRoute, redirect } from '@tanstack/solid-router';
import { authClient } from '../lib/auth-client';

export const Route = createFileRoute('/logout')({
  loader: async () => {
    await authClient.signOut();
    throw redirect({ to: '/login' });
  },
});
