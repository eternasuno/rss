'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DashboardHeader } from '@/components/header';
import type { feed as feedTable } from '@/db/schema';
import { deleteFeed, getUserFeeds } from '@/lib/actions/feed';
import { useSession } from '@/lib/auth-client';

type Feed = typeof feedTable.$inferSelect;

function FeedBreadcrumb() {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <a
          href="/dashboard"
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          Dashboard
        </a>
        <span className="text-zinc-400">/</span>
        <h2 className="text-2xl font-bold tracking-tight">Feeds</h2>
      </div>
      <a
        href="/dashboard/feeds/new"
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        New Feed
      </a>
    </div>
  );
}

function FeedEmptyState() {
  return (
    <div className="p-12 text-center rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">No feeds yet.</p>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">Create your first RSS feed.</p>
      <a
        href="/dashboard/feeds/new"
        className="mt-4 inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Create Feed
      </a>
    </div>
  );
}

function FeedCard({
  feed,
  onDelete,
  onCopy,
  copiedId,
}: {
  feed: Feed;
  onDelete: (id: string) => void;
  onCopy: (id: string) => void;
  copiedId: string | null;
}) {
  const xmlUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/feeds/${feed.id}.xml`
      : `/feeds/${feed.id}.xml`;

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100 line-clamp-1">
            {feed.title}
          </h3>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
            {feed.language}
          </span>
        </div>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 min-h-[2.5rem]">
          {feed.description || 'No description provided.'}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={xmlUrl}
            className="flex-1 min-w-0 rounded-md border border-zinc-300 bg-zinc-50 px-2 py-1 text-xs text-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button
            type="button"
            onClick={() => onCopy(feed.id)}
            className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            {copiedId === feed.id ? 'Copied' : 'Copy'}
          </button>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <a
            href={`/dashboard/feeds/${feed.id}`}
            className="text-xs font-medium text-zinc-900 hover:underline dark:text-zinc-100"
          >
            View Details
          </a>
          <button
            type="button"
            onClick={() => onDelete(feed.id)}
            className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function FeedList({
  feeds,
  onDelete,
  onCopy,
  copiedId,
}: {
  feeds: Feed[];
  onDelete: (id: string) => void;
  onCopy: (id: string) => void;
  copiedId: string | null;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {feeds.map((f) => (
        <FeedCard key={f.id} feed={f} onDelete={onDelete} onCopy={onCopy} copiedId={copiedId} />
      ))}
    </div>
  );
}

function useFeeds() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/sign-in');
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session) {
      getUserFeeds()
        .then((data) => {
          setFeeds(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || 'Failed to load feeds');
          setLoading(false);
        });
    }
  }, [session]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this feed?')) {
      return;
    }
    const res = await deleteFeed(id);
    if ('error' in res && res.error) {
      setError(res.error);
    } else {
      setFeeds((prev) => prev.filter((f) => f.id !== id));
    }
  };

  const handleCopy = async (id: string) => {
    const xmlUrl = `${window.location.origin}/feeds/${id}.xml`;
    await navigator.clipboard.writeText(xmlUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return {
    copiedId,
    error,
    feeds,
    handleCopy,
    handleDelete,
    isPending,
    loading,
    session,
  };
}

export default function FeedsPage() {
  const { feeds, loading, error, copiedId, session, isPending, handleDelete, handleCopy } =
    useFeeds();

  if (isPending || loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <DashboardHeader userName={session?.user.name} />
        <main className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center p-4">
          <p className="text-sm text-zinc-500">Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader userName={session?.user.name} />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8">
        <FeedBreadcrumb />
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}
        {feeds.length === 0 ? (
          <FeedEmptyState />
        ) : (
          <FeedList
            feeds={feeds}
            onDelete={handleDelete}
            onCopy={handleCopy}
            copiedId={copiedId}
          />
        )}
      </main>
    </div>
  );
}
