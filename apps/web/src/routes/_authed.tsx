import { createFileRoute, Outlet, redirect } from '@tanstack/solid-router';
import { getCurrentUser } from '../server/auth';

export const Route = createFileRoute('/_authed')({
  beforeLoad: async ({ location }) => {
    const user = await getCurrentUser();
    if (!user) {
      throw redirect({ search: { redirect: location.href }, to: '/login' });
    }
    return { user };
  },
  component: () => (
    <main style={{ margin: '0 auto', 'max-width': '960px', padding: '24px' }}>
      <Outlet />
    </main>
  ),
});
