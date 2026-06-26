import { createFileRoute, useRouter } from '@tanstack/solid-router';
import { Show, For, createSignal, Suspense } from 'solid-js';
import { authClient } from '~/lib/auth-client';
import { createFeedFn, listUserFeedsFn } from '~/lib/feed-actions';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  const session = authClient.useSession();
  const router = useRouter();

  const [showForm, setShowForm] = createSignal(false);
  const [title, setTitle] = createSignal('');
  const [description, setDescription] = createSignal('');
  const [link, setLink] = createSignal('');
  const [error, setError] = createSignal('');

  const handleCreateFeed = async (e: Event) => {
    e.preventDefault();
    setError('');

    try {
      await createFeedFn({
        data: { description: description(), link: link(), title: title() },
      });
      setShowForm(false);
      setTitle('');
      setDescription('');
      setLink('');
      router.invalidate();
    } catch (err) {
      setError(String(err));
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    router.invalidate();
  };

  return (
    <div style={{ 'max-width': '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <Suspense fallback={<p>Loading...</p>}>
        <Show
          when={session()}
          fallback={
            <div>
              <h1>RSS Feed Manager</h1>
              <p>Manage your RSS feeds and podcast episodes.</p>
              <div style={{ display: 'flex', gap: '1rem', 'margin-top': '1.5rem' }}>
                <a
                  href="/login"
                  style={{
                    background: 'var(--color-primary)',
                    color: '#fff',
                    padding: '0.5rem 1rem',
                    'border-radius': 'var(--radius)',
                  }}
                >
                  Sign In
                </a>
                <a
                  href="/register"
                  style={{
                    border: '1px solid var(--color-border)',
                    padding: '0.5rem 1rem',
                    'border-radius': 'var(--radius)',
                  }}
                >
                  Register
                </a>
              </div>
            </div>
          }
        >
          <div style={{ display: 'flex', 'justify-content': 'space-between', 'align-items': 'center' }}>
            <h1>Your Feeds</h1>
            <div style={{ display: 'flex', gap: '0.75rem', 'align-items': 'center' }}>
              <span style={{ color: 'var(--color-muted)', 'font-size': '0.875rem' }}>
                {session()?.data?.user?.email}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                style={{
                  background: 'none',
                  border: '1px solid var(--color-border)',
                  padding: '0.35rem 0.75rem',
                  'border-radius': 'var(--radius)',
                  'font-size': '0.875rem',
                }}
              >
                Sign Out
              </button>
            </div>
          </div>

          <div style={{ 'margin-bottom': '1.5rem' }}>
            <Show
              when={!showForm()}
              fallback={
                <form
                  onSubmit={handleCreateFeed}
                  style={{
                    border: '1px solid var(--color-border)',
                    padding: '1rem',
                    'border-radius': 'var(--radius)',
                  }}
                >
                  <div style={{ 'margin-bottom': '0.75rem' }}>
                    <label
                      for="title"
                      style={{ display: 'block', 'margin-bottom': '0.25rem', 'font-weight': 600 }}
                    >
                      Title
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={title()}
                      onInput={(e) => setTitle(e.currentTarget.value)}
                      required
                      style={{
                        border: '1px solid var(--color-border)',
                        padding: '0.5rem',
                        'border-radius': 'var(--radius)',
                        width: '100%',
                      }}
                    />
                  </div>
                  <div style={{ 'margin-bottom': '0.75rem' }}>
                    <label
                      for="description"
                      style={{ display: 'block', 'margin-bottom': '0.25rem', 'font-weight': 600 }}
                    >
                      Description
                    </label>
                    <input
                      id="description"
                      type="text"
                      value={description()}
                      onInput={(e) => setDescription(e.currentTarget.value)}
                      required
                      style={{
                        border: '1px solid var(--color-border)',
                        padding: '0.5rem',
                        'border-radius': 'var(--radius)',
                        width: '100%',
                      }}
                    />
                  </div>
                  <div style={{ 'margin-bottom': '0.75rem' }}>
                    <label
                      for="link"
                      style={{ display: 'block', 'margin-bottom': '0.25rem', 'font-weight': 600 }}
                    >
                      Link (URL)
                    </label>
                    <input
                      id="link"
                      type="url"
                      value={link()}
                      onInput={(e) => setLink(e.currentTarget.value)}
                      required
                      style={{
                        border: '1px solid var(--color-border)',
                        padding: '0.5rem',
                        'border-radius': 'var(--radius)',
                        width: '100%',
                      }}
                    />
                  </div>
                  <Show when={error()}>
                    <p style={{ color: 'var(--color-error)', 'font-size': '0.875rem' }}>{error()}</p>
                  </Show>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="submit"
                      style={{
                        background: 'var(--color-primary)',
                        color: '#fff',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        'border-radius': 'var(--radius)',
                      }}
                    >
                      Create Feed
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      style={{
                        background: 'none',
                        border: '1px solid var(--color-border)',
                        padding: '0.5rem 1rem',
                        'border-radius': 'var(--radius)',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              }
            >
              <button
                type="button"
                onClick={() => setShowForm(true)}
                style={{
                  background: 'var(--color-primary)',
                  color: '#fff',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  'border-radius': 'var(--radius)',
                }}
              >
                + Create Feed
              </button>
            </Show>
          </div>

          <FeedList />
        </Show>
      </Suspense>
    </div>
  );
}

function FeedList() {
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
          fallback={<p style={{ color: 'var(--color-muted)' }}>No feeds yet. Create one above.</p>}
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
                  <div style={{ color: 'var(--color-muted)', 'font-size': '0.875rem', 'margin-top': '0.25rem' }}>
                    {feed.data.description}
                  </div>
                </a>
              )}
            </For>
          </div>
        </Show>
      </Show>
    </Show>
  );
}
