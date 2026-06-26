import { createFileRoute } from '@tanstack/solid-router';
import { Show, For, createSignal, Suspense } from 'solid-js';
import { listUserFeedsFn } from '~/lib/feed-actions';

export const Route = createFileRoute('/feeds/')({
  component: FeedsList,
});

function FeedsList() {
  const [feeds, setFeeds] = createSignal<Awaited<ReturnType<typeof listUserFeedsFn>>>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal('');

  listUserFeedsFn()
    .then((data) => {
      setFeeds(data);
      setLoading(false);
    })
    .catch((err) => {
      setError(String(err));
      setLoading(false);
    });

  return (
    <div style={{ 'max-width': '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1>Feeds</h1>
      <Suspense fallback={<p style={{ color: 'var(--color-muted)' }}>Loading feeds...</p>}>
        <Show
          when={!loading()}
          fallback={<p style={{ color: 'var(--color-muted)' }}>Loading feeds...</p>}
        >
          <Show
            when={!error()}
            fallback={<p style={{ color: 'var(--color-error)' }}>{error()}</p>}
          >
            <Show
              when={feeds().length > 0}
              fallback={
                <p style={{ color: 'var(--color-muted)' }}>
                  No feeds yet. <a href="/">Create one</a>
                </p>
              }
            >
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '0.75rem' }}>
                <For each={feeds()}>
                  {(feed) => (
                    <a
                      href={`/feeds/${feed.id}`}
                      style={{
                        border: '1px solid var(--color-border)',
                        padding: '1rem',
                        'border-radius': 'var(--radius)',
                        color: 'inherit',
                        'text-decoration': 'none',
                      }}
                    >
                      <div style={{ 'font-weight': 600, 'font-size': '1.05rem' }}>
                        {feed.data.title}
                      </div>
                      <div
                        style={{
                          color: 'var(--color-muted)',
                          'font-size': '0.875rem',
                          'margin-top': '0.25rem',
                        }}
                      >
                        {feed.data.description}
                      </div>
                    </a>
                  )}
                </For>
              </div>
            </Show>
          </Show>
        </Show>
      </Suspense>
    </div>
  );
}
