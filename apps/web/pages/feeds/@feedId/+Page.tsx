import { createResource, createSignal, Show } from 'solid-js';
import { usePageContext } from 'vike-solid/usePageContext';
import { AddItemForm } from './AddItemForm';
import { Breadcrumbs, FeedInfo } from './FeedInfo';
import { ItemList } from './ItemList';

async function addItemRequest({ feedId, title }: { feedId: string; title: string }) {
  const res = await fetch(`/api/feeds/${feedId}/items`, {
    body: JSON.stringify({ data: { title } }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json();
    return { error: err.message || 'Failed', ok: false };
  }
  return { ok: true };
}

function makeHandler({
  feedId,
  title,
  setTitle,
  setAdding,
  setError,
  refetch,
}: {
  feedId: string;
  title: () => string;
  setTitle: (v: string) => void;
  setAdding: (v: boolean) => void;
  setError: (v: string) => void;
  refetch: () => void;
}) {
  return async (e: Event) => {
    e.preventDefault();
    setAdding(true);
    setError('');
    const result = await addItemRequest({ feedId, title: title() });
    if (!result.ok) {
      setError(result.error || 'Failed');
      setAdding(false);
      return;
    }
    setTitle('');
    setAdding(false);
    refetch();
  };
}

function ItemControls({ feedId, refetch }: { feedId: string; refetch: () => void }) {
  const [title, setTitle] = createSignal('');
  const [adding, setAdding] = createSignal(false);
  const [error, setError] = createSignal('');
  const handleAddItem = makeHandler({ feedId, refetch, setAdding, setError, setTitle, title });

  return (
    <AddItemForm
      title={title()}
      setTitle={setTitle}
      error={error()}
      adding={adding()}
      onSubmit={handleAddItem}
    />
  );
}

function TitleSection({ feedId }: { feedId: string }) {
  const [data, { refetch }] = createResource(() =>
    fetch(`/api/feeds/${feedId}`).then((r) => r.json())
  );

  return (
    <Show when={data()?.feed} fallback={<div class="skeleton h-32 w-full" />}>
      <Breadcrumbs feedTitle={data()?.feed?.data?.title ?? 'Feed'} />
      <FeedInfo feed={data()?.feed} feedId={feedId} />
      <ItemControls feedId={feedId} refetch={refetch} />
      <h2 class="text-xl font-bold mb-4">Items</h2>
      <ItemList items={data()?.items ?? []} />
    </Show>
  );
}

export default function FeedDetailPage() {
  const ctx = usePageContext();
  const feedId = ctx.routeParams.feedId as string;
  return <div>{ctx.user && <TitleSection feedId={feedId} />}</div>;
}
