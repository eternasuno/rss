'use client';

import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth-client';

export function DashboardHeader({ userName }: { userName?: string }) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/sign-in');
    router.refresh();
  };

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <h1 className="text-lg font-semibold">
          <a href="/dashboard" className="hover:opacity-80">
            RSS Feed Manager
          </a>
        </h1>
        <div className="flex items-center gap-3">
          {userName && (
            <span className="text-sm text-zinc-600 dark:text-zinc-400">{userName}</span>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
