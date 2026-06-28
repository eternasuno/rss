'use client';

import { useRouter } from 'next/navigation';
import { use, useCallback, useEffect, useState } from 'react';
import { DashboardHeader } from '@/components/header';
import type { feed as feedTable, item as itemTable } from '@/db/schema';
import { addItem, deleteFeed, deleteItem, getFeed, updateFeed } from '@/lib/actions/feed';
import { useSession } from '@/lib/auth-client';

type Feed = typeof feedTable.$inferSelect;
type Item = typeof itemTable.$inferSelect;

function FeedDetailBreadcrumb({ title }: { title: string }) {
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
      <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 line-clamp-1">
        {title}
      </h2>
    </div>
  );
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

function TextareaField({
  id,
  label,
  rows = 3,
  defaultValue,
}: {
  id: string;
  label: string;
  rows?: number;
  defaultValue?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <textarea
        id={id}
        name={id}
        rows={rows}
        defaultValue={defaultValue}
        className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800"
      />
    </div>
  );
}

function EditFeedModal({
  feed,
  onClose,
  onSubmit,
  loading,
}: {
  feed: Feed;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-4">Edit Feed</h3>
        <form action={onSubmit} className="space-y-4">
          <InputField id="title" label="Title" defaultValue={feed.title} required />
          <TextareaField id="description" label="Description" defaultValue={feed.description} />
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField id="link" label="Feed Link" type="url" defaultValue={feed.link} />
            <InputField id="language" label="Language" defaultValue={feed.language} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              id="siteUrl"
              label="Site URL"
              type="url"
              defaultValue={feed.siteUrl || ''}
            />
            <InputField
              id="authorName"
              label="Author Name"
              defaultValue={feed.authorName || ''}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddItemModal({
  onClose,
  onSubmit,
  loading,
}: {
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-4">Add Feed Item</h3>
        <form action={onSubmit} className="space-y-4">
          <InputField id="title" label="Title" required />
          <InputField id="link" label="Link" type="url" />
          <InputField id="author" label="Author" />
          <TextareaField id="description" label="Description" />
          <TextareaField id="content" label="Content" rows={5} />
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {loading ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ItemsTable({
  items,
  onDeleteItem,
}: {
  items: Item[];
  onDeleteItem: (itemId: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="p-8 text-center border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950">
        <p className="text-sm text-zinc-500">No items in this feed yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Title</th>
            <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Author</th>
            <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Published</th>
            <th className="px-4 py-3 text-right font-medium text-zinc-600 dark:text-zinc-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr
              key={it.id}
              className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
            >
              <td className="px-4 py-3">
                {it.link ? (
                  <a
                    href={it.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-zinc-900 hover:underline dark:text-zinc-100"
                  >
                    {it.title}
                  </a>
                ) : (
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{it.title}</span>
                )}
              </td>
              <td className="px-4 py-3 text-zinc-500">{it.author || '-'}</td>
              <td className="px-4 py-3 text-zinc-500">
                {it.pubDate ? new Date(it.pubDate).toLocaleDateString() : '-'}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => onDeleteItem(it.id)}
                  className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FeedXmlUrlSection({
  xmlUrl,
  copied,
  onCopy,
}: {
  xmlUrl: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="mt-6 border-t border-zinc-100 pt-4 dark:border-zinc-800">
      <label
        htmlFor="xmlUrlInput"
        className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2"
      >
        RSS Feed XML URL
      </label>
      <div className="flex items-center gap-2 max-w-xl">
        <input
          id="xmlUrlInput"
          type="text"
          readOnly
          value={xmlUrl}
          className="flex-1 min-w-0 rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button
          type="button"
          onClick={onCopy}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800 shrink-0"
        >
          {copied ? 'Copied' : 'Copy URL'}
        </button>
      </div>
    </div>
  );
}

function FeedMetadataCard({
  feed,
  xmlUrl,
  copied,
  onCopy,
  onEditClick,
  onDeleteFeed,
}: {
  feed: Feed;
  xmlUrl: string;
  copied: boolean;
  onCopy: () => void;
  onEditClick: () => void;
  onDeleteFeed: () => void;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{feed.title}</h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {feed.description || 'No description provided.'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onEditClick}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800"
          >
            Edit Feed
          </button>
          <button
            type="button"
            onClick={onDeleteFeed}
            className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
          >
            Delete Feed
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 border-t border-zinc-100 pt-4 dark:border-zinc-800 text-sm">
        <div>
          <span className="font-medium text-zinc-500">Language:</span>{' '}
          <span className="text-zinc-900 dark:text-zinc-100">{feed.language}</span>
        </div>
        {feed.authorName && (
          <div>
            <span className="font-medium text-zinc-500">Author:</span>{' '}
            <span className="text-zinc-900 dark:text-zinc-100">{feed.authorName}</span>
          </div>
        )}
      </div>
      <FeedXmlUrlSection xmlUrl={xmlUrl} copied={copied} onCopy={onCopy} />
    </div>
  );
}

function FeedDetailModals({
  feedData,
  showEdit,
  setShowEdit,
  showAddItem,
  setShowAddItem,
  handleEditSubmit,
  actionLoading,
  handleAddItemSubmit,
  itemLoading,
}: {
  feedData: Feed;
  showEdit: boolean;
  setShowEdit: (show: boolean) => void;
  showAddItem: boolean;
  setShowAddItem: (show: boolean) => void;
  handleEditSubmit: (formData: FormData) => void;
  actionLoading: boolean;
  handleAddItemSubmit: (formData: FormData) => void;
  itemLoading: boolean;
}) {
  return (
    <>
      {showEdit && (
        <EditFeedModal
          feed={feedData}
          onClose={() => setShowEdit(false)}
          onSubmit={handleEditSubmit}
          loading={actionLoading}
        />
      )}
      {showAddItem && (
        <AddItemModal
          onClose={() => setShowAddItem(false)}
          onSubmit={handleAddItemSubmit}
          loading={itemLoading}
        />
      )}
    </>
  );
}

function useFeedDetail(id: string) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [feedData, setFeedData] = useState<Feed | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/sign-in');
    }
  }, [session, isPending, router]);

  const loadFeed = useCallback(async () => {
    const res = await getFeed(id);
    if ('error' in res && res.error) {
      setError(res.error);
    } else if ('feed' in res) {
      setFeedData(res.feed);
      setItems(res.items);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (session) {
      loadFeed();
    }
  }, [session, loadFeed]);

  return {
    error,
    feedData,
    isPending,
    items,
    loading,
    session,
    setError,
    setFeedData,
    setItems,
  };
}

function getOptionalString(formData: FormData, key: string): string | undefined {
  const val = formData.get(key);
  return typeof val === 'string' && val ? val : undefined;
}

function useFeedActions({
  id,
  setFeedData,
  setError,
}: {
  id: string;
  setFeedData: (feed: Feed) => void;
  setError: (err: string | null) => void;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const handleCopy = async () => {
    const xmlUrl = `${window.location.origin}/feeds/${id}.xml`;
    await navigator.clipboard.writeText(xmlUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteFeed = async () => {
    if (!window.confirm('Are you sure you want to delete this feed?')) {
      return;
    }
    setActionLoading(true);
    const res = await deleteFeed(id);
    if ('error' in res && res.error) {
      setError(res.error);
      setActionLoading(false);
    } else {
      router.push('/dashboard/feeds');
    }
  };

  const handleEditSubmit = async (formData: FormData) => {
    setActionLoading(true);
    const res = await updateFeed(id, {
      authorName: getOptionalString(formData, 'authorName'),
      description: getOptionalString(formData, 'description'),
      language: getOptionalString(formData, 'language'),
      link: getOptionalString(formData, 'link'),
      siteUrl: getOptionalString(formData, 'siteUrl'),
      title: getOptionalString(formData, 'title'),
    });
    if ('error' in res) {
      setError(res.error);
    } else {
      setFeedData(res);
      setShowEdit(false);
    }
    setActionLoading(false);
  };

  return {
    actionLoading,
    copied,
    handleCopy,
    handleDeleteFeed,
    handleEditSubmit,
    setShowEdit,
    showEdit,
  };
}

function useItemActions({
  id,
  setItems,
  setError,
}: {
  id: string;
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  setError: (err: string | null) => void;
}) {
  const [showAddItem, setShowAddItem] = useState(false);
  const [itemLoading, setItemLoading] = useState(false);

  const handleAddItemSubmit = async (formData: FormData) => {
    setItemLoading(true);
    const title = formData.get('title') as string;
    if (!title) {
      setError('Title is required');
      setItemLoading(false);
      return;
    }
    const res = await addItem(id, {
      author: getOptionalString(formData, 'author'),
      content: getOptionalString(formData, 'content'),
      description: getOptionalString(formData, 'description'),
      link: getOptionalString(formData, 'link'),
      title,
    });
    if ('error' in res) {
      setError(res.error ?? null);
    } else {
      setItems((prev) => [res as Item, ...prev]);
      setShowAddItem(false);
    }
    setItemLoading(false);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }
    const res = await deleteItem(id, itemId);
    if ('error' in res && res.error) {
      setError(res.error ?? null);
    } else {
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    }
  };

  return {
    handleAddItemSubmit,
    handleDeleteItem,
    itemLoading,
    setShowAddItem,
    showAddItem,
  };
}

function LoadingView({ userName }: { userName?: string }) {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader userName={userName} />
      <main className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center p-4">
        <p className="text-sm text-zinc-500">Loading...</p>
      </main>
    </div>
  );
}

interface LoadedProps {
  id: string;
  feedData: Feed;
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  setError: (err: string | null) => void;
  setFeedData: (feed: Feed) => void;
}

function FeedDetailLoaded({ id, feedData, items, setItems, setError, setFeedData }: LoadedProps) {
  const {
    copied,
    showEdit,
    setShowEdit,
    actionLoading,
    handleCopy,
    handleDeleteFeed,
    handleEditSubmit,
  } = useFeedActions({ id, setError, setFeedData });

  const { showAddItem, setShowAddItem, itemLoading, handleAddItemSubmit, handleDeleteItem } =
    useItemActions({ id, setError, setItems });

  const xmlUrl = `${window.location.origin}/feeds/${id}.xml`;

  return (
    <>
      <FeedMetadataCard
        feed={feedData}
        xmlUrl={xmlUrl}
        copied={copied}
        onCopy={handleCopy}
        onEditClick={() => setShowEdit(true)}
        onDeleteFeed={handleDeleteFeed}
      />
      <div className="mt-8 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Feed Items</h3>
        <button
          type="button"
          onClick={() => setShowAddItem(true)}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Add Item
        </button>
      </div>
      <div className="mt-4">
        <ItemsTable items={items} onDeleteItem={handleDeleteItem} />
      </div>
      <FeedDetailModals
        feedData={feedData}
        showEdit={showEdit}
        setShowEdit={setShowEdit}
        showAddItem={showAddItem}
        setShowAddItem={setShowAddItem}
        handleEditSubmit={handleEditSubmit}
        actionLoading={actionLoading}
        handleAddItemSubmit={handleAddItemSubmit}
        itemLoading={itemLoading}
      />
    </>
  );
}

export default function FeedDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { feedData, items, setItems, loading, error, setError, session, isPending, setFeedData } =
    useFeedDetail(id);

  if (isPending || loading || !feedData) {
    return <LoadingView userName={session?.user.name} />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader userName={session?.user.name} />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8">
        <FeedDetailBreadcrumb title={feedData.title} />
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}
        <FeedDetailLoaded
          id={id}
          feedData={feedData}
          items={items}
          setItems={setItems}
          setError={setError}
          setFeedData={setFeedData}
        />
      </main>
    </div>
  );
}
