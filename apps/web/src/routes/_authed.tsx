import { createFileRoute, Outlet, redirect } from '@tanstack/solid-router';
import { getCurrentUser } from '../server/auth';

export const Route = createFileRoute('/_authed')({
  beforeLoad: async ({ location }) => {
    const user = await getCurrentUser();
    if (!user) {
      throw redirect({ to: '/login', search: { redirect: location.href } });
    }
    return { user };
  },
  component: () => (
    <main style={{ 'max-width': '960px', margin: '0 auto', padding: '24px' }}>
      <Outlet />
    </main>
  ),
});
