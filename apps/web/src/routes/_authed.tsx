import { createFileRoute, Outlet, redirect } from '@tanstack/solid-router';
import { getSession } from '../lib/auth-utils';

export const Route = createFileRoute('/_authed')({
  beforeLoad: async ({ location }) => {
    const session = await getSession();
    if (!session || !session.user) {
      throw redirect({ search: { redirect: location.href }, to: '/login' });
    }

    return { user: session.user };
  },
  component: () => (
    <main
      style={{
        margin: '0 auto',
        'max-width': '960px',
        padding: '24px',
      }}
    >
      <Outlet />
    </main>
  ),
});
