import { createFileRoute } from '@tanstack/solid-router';
import { Show, For, createSignal, createResource, Suspense } from 'solid-js';
import { addItemFn, getFeedFn } from '~/lib/feed-actions';
import type { Item } from '@rss/core/entity';

export const Route = createFileRoute('/feeds/$feedId')({
  component: FeedDetail,
});

function FeedDetail() {
  const params = Route.useParams();
  const feedId = params().feedId;

  const [feedData, { refetch }] = createResource(
    () => feedId,
    (id: string) => getFeedFn({ data: { feedId: id } }),
  );

  const [itemTitle, setItemTitle] = createSignal('');
  const [addError, setAddError] = createSignal('');
  const [adding, setAdding] = createSignal(false);

  const handleAddItem = async (e: Event) => {
    e.preventDefault();
    setAddError('');
    setAdding(true);

    try {
      await addItemFn({
        data: { feedId, itemData: { title: itemTitle() } },
      });
      setItemTitle('');
      refetch();
    } catch (err) {
      setAddError(String(err));
    }

    setAdding(false);
  };

  const copyFeedUrl = () => {
    const url = `${window.location.origin}/feed/${feedId}`;

    navigator.clipboard.writeText(url).catch(() => {
      // Fallback
    });
  };

  return (
    <div style={{ 'max-width': '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <a
        href="/"
        style={{ 'font-size': '0.875rem', color: 'var(--color-muted)' }}
      >
        ← Back to feeds
      </a>

      <Suspense fallback={<p style={{ color: 'var(--color-muted)' }}>Loading feed...</p>}>
        <Show
          when={feedData()}
          fallback={
            <Show
              when={feedData.error}
              fallback={<p style={{ color: 'var(--color-muted)' }}>Loading...</p>}
            >
              <p style={{ color: 'var(--color-error)' }}>Failed to load feed: {String(feedData.error)}</p>
            </Show>
          }
        >
          <h1 style={{ 'margin-top': '0.5rem' }}>{feedData()?.feed.data.title}</h1>
          <p style={{ color: 'var(--color-muted)' }}>{feedData()?.feed.data.description}</p>

          <div
            style={{
              background: '#f9fafb',
              border: '1px solid var(--color-border)',
              padding: '0.75rem 1rem',
              'border-radius': 'var(--radius)',
              'margin-bottom': '1.5rem',
              'font-size': '0.875rem',
            }}
          >
            <span style={{ 'font-weight': 600 }}>Feed URL: </span>
            <code style={{ 'font-family': 'var(--font-mono)', 'font-size': '0.8125rem' }}>
              {typeof window !== 'undefined' ? `${window.location.origin}/feed/${feedId}` : `/feed/${feedId}`}
            </code>
            <button
              type="button"
              onClick={copyFeedUrl}
              style={{
                'margin-left': '0.5rem',
                background: 'none',
                border: '1px solid var(--color-border)',
                padding: '0.15rem 0.5rem',
                'border-radius': 'var(--radius)',
                'font-size': '0.75rem',
                cursor: 'pointer',
              }}
            >
              Copy
            </button>
          </div>

          <h2 style={{ 'font-size': '1.1rem' }}>Add Item</h2>
          <form
            onSubmit={handleAddItem}
            style={{
              display: 'flex',
              gap: '0.5rem',
              'margin-bottom': '1.5rem',
            }}
          >
            <input
              type="text"
              value={itemTitle()}
              onInput={(e) => setItemTitle(e.currentTarget.value)}
              placeholder="Item title"
              required
              style={{
                border: '1px solid var(--color-border)',
                padding: '0.5rem',
                'border-radius': 'var(--radius)',
                flex: 1,
              }}
            />
            <button
              type="submit"
              disabled={adding()}
              style={{
                background: 'var(--color-primary)',
                color: '#fff',
                border: 'none',
                padding: '0.5rem 1rem',
                'border-radius': 'var(--radius)',
                cursor: adding() ? 'not-allowed' : 'pointer',
                opacity: adding() ? 0.7 : 1,
              }}
            >
              {adding() ? 'Adding...' : 'Add'}
            </button>
          </form>
          <Show when={addError()}>
            <p style={{ color: 'var(--color-error)', 'font-size': '0.875rem' }}>{addError()}</p>
          </Show>

          <h2 style={{ 'font-size': '1.1rem' }}>Items</h2>
          <Show
            when={feedData()?.items.length}
            fallback={<p style={{ color: 'var(--color-muted)' }}>No items yet.</p>}
          >
            <div style={{ display: 'flex', 'flex-direction': 'column', gap: '0.5rem' }}>
              <For each={feedData()?.items}>
                {(item: Item) => (
                  <div
                    style={{
                      border: '1px solid var(--color-border)',
                      padding: '0.75rem 1rem',
                      'border-radius': 'var(--radius)',
                    }}
                  >
                    <div style={{ 'font-weight': 500 }}>{item.data.title}</div>
                    <div style={{ color: 'var(--color-muted)', 'font-size': '0.75rem', 'margin-top': '0.25rem' }}>
                      {new Date((item.createdAt as unknown as string)).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </Show>
      </Suspense>
    </div>
  );
}
