'use client';

import { useCallback, useEffect, useState } from 'react';
import { createApiKey, deleteApiKey, listApiKeys } from '@/lib/actions/api-key';

interface ApiKeyInfo {
  id: string;
  name: string | null;
  start: string | null;
  prefix: string | null;
  createdAt: string;
}

function NewKeyBanner({ newKey, onCopy }: { newKey: string; onCopy: (text: string) => void }) {
  return (
    <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
      <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
        Your new API key
      </p>
      <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
        Copy this key now. You won&apos;t be able to see it again.
      </p>
      <div className="mt-2 flex items-center gap-2">
        <code className="flex-1 break-all rounded border border-emerald-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-emerald-700 dark:bg-zinc-900 dark:text-zinc-100">
          {newKey}
        </code>
        <button
          type="button"
          onClick={() => onCopy(newKey)}
          className="rounded-lg border border-emerald-300 px-3 py-2 text-sm font-medium transition-colors hover:bg-emerald-100 dark:border-emerald-700 dark:hover:bg-emerald-900"
        >
          Copy
        </button>
      </div>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="p-6 text-center">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">No API keys yet.</p>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
        Create a key to add items to your feeds via the API.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Create API Key
      </button>
    </div>
  );
}

function KeyTable({
  keys,
  deleting,
  onRevoke,
}: {
  keys: ApiKeyInfo[];
  deleting: boolean;
  onRevoke: () => void;
}) {
  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-zinc-200 dark:border-zinc-800">
          <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Name</th>
          <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Key</th>
          <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Created</th>
          <th className="px-4 py-3 text-right font-medium text-zinc-600 dark:text-zinc-400">
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {keys.map((key) => (
          <tr
            key={key.id}
            className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
          >
            <td className="px-4 py-3">{key.name ?? 'Default'}</td>
            <td className="px-4 py-3 font-mono text-zinc-500">{key.start}...</td>
            <td className="px-4 py-3 text-zinc-500">
              {new Date(key.createdAt).toLocaleDateString()}
            </td>
            <td className="px-4 py-3 text-right">
              <button
                type="button"
                onClick={onRevoke}
                disabled={deleting}
                className="rounded-lg border border-red-300 px-3 py-1 text-sm text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Revoke'}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    const result = await listApiKeys();
    if (result.error) {
      setError(result.error);
      setKeys([]);
    } else {
      setKeys(result.keys ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleCreate = async () => {
    setError(null);
    const result = await createApiKey();
    if (result.error) {
      setError(result.error);
    } else if (result.key) {
      setNewKey(result.key.key);
      await fetchKeys();
    }
  };

  const handleDelete = async () => {
    if (keys.length === 0) return;
    setDeleting(true);
    const result = await deleteApiKey(keys[0].id);
    if (result.error) {
      setError(result.error);
    }
    setNewKey(null);
    setDeleting(false);
    await fetchKeys();
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold">RSS Feed Manager</h1>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">Settings</span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <a
            href="/dashboard"
            className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            Dashboard
          </a>
          <span className="text-zinc-400">/</span>
          <h2 className="text-2xl font-bold tracking-tight">API Keys</h2>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
            {error}
          </div>
        )}

        {newKey && <NewKeyBanner newKey={newKey} onCopy={copyToClipboard} />}

        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800">
          {loading ? (
            <div className="p-6 text-center text-sm text-zinc-500">Loading...</div>
          ) : keys.length === 0 ? (
            <EmptyState onCreate={handleCreate} />
          ) : (
            <KeyTable keys={keys} deleting={deleting} onRevoke={handleDelete} />
          )}
        </div>
      </main>
    </div>
  );
}
