'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DashboardHeader } from '@/components/header';
import { createFeed } from '@/lib/actions/feed';
import { useSession } from '@/lib/auth-client';

function NewFeedBreadcrumb() {
  return (
    <div className="mb-6 flex items-center gap-3">
      <a
        href="/dashboard"
        className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        Dashboard
      </a>
      <span className="text-zinc-400">/</span>
      <a
        href="/dashboard/feeds"
        className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        Feeds
      </a>
      <span className="text-zinc-400">/</span>
      <h2 className="text-2xl font-bold tracking-tight">New Feed</h2>
    </div>
  );
}

function getOptionalString(formData: FormData, key: string): string | undefined {
  const val = formData.get(key);
  return typeof val === 'string' && val ? val : undefined;
}

function InputField({
  id,
  label,
  type = 'text',
  defaultValue,
  required,
}: {
  id: string;
  label: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800"
      />
    </div>
  );
}

function TextareaField({ id, label, rows = 3 }: { id: string; label: string; rows?: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <textarea
        id={id}
        name={id}
        rows={rows}
        className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800"
      />
    </div>
  );
}

function NewFeedForm({
  onSubmit,
  loading,
  error,
}: {
  onSubmit: (formData: FormData) => void;
  loading: boolean;
  error: string | null;
}) {
  return (
    <form action={onSubmit} className="space-y-4 max-w-xl">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
      <InputField id="title" label="Title" required />
      <TextareaField id="description" label="Description" />
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField id="link" label="Feed Link" type="url" />
        <InputField id="language" label="Language" defaultValue="en" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField id="siteUrl" label="Site URL" type="url" />
        <InputField id="authorName" label="Author Name" />
      </div>
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {loading ? 'Creating...' : 'Create Feed'}
        </button>
        <a
          href="/dashboard/feeds"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}

export default function NewFeedPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/sign-in');
    }
  }, [session, isPending, router]);

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    setLoading(true);
    try {
      const title = formData.get('title') as string;
      const res = await createFeed({
        authorName: getOptionalString(formData, 'authorName'),
        description: getOptionalString(formData, 'description'),
        language: getOptionalString(formData, 'language') || 'en',
        link: getOptionalString(formData, 'link'),
        siteUrl: getOptionalString(formData, 'siteUrl'),
        title,
      });
      router.push(`/dashboard/feeds/${res.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create feed';
      setError(message);
      setLoading(false);
    }
  };

  if (isPending) {
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
        <NewFeedBreadcrumb />
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <NewFeedForm onSubmit={handleSubmit} loading={loading} error={error} />
        </div>
      </main>
    </div>
  );
}
