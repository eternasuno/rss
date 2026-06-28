import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/sign-in');
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold">RSS Feed Manager</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">{session.user.name}</span>
            <form
              action={async () => {
                'use server';
                const { auth } = await import('@/lib/auth');
                await auth.api.signOut({
                  headers: await headers(),
                });
                redirect('/sign-in');
              }}
            >
              <button
                type="submit"
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8">
        <h2 className="mb-6 text-2xl font-bold tracking-tight">Dashboard</h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <h3 className="font-medium">Feeds</h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Manage your RSS feeds</p>
          </div>
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <h3 className="font-medium">Items</h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Browse feed items</p>
          </div>
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <h3 className="font-medium">Settings</h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Account settings</p>
          </div>
        </div>
      </main>
    </div>
  );
}
