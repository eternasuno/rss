import { createFileRoute, useRouter } from '@tanstack/solid-router';
import { createResource, createSignal, For, Show } from 'solid-js';
import { createFeedFn, listFeedsFn } from '../../server/feeds';

export const Route = createFileRoute('/_authed/admin/')({
  component: AdminPage,
});

const AdminPage = () => {
  const router = useRouter();
  const [feeds, { refetch }] = createResource(() => listFeedsFn());
  const [title, setTitle] = createSignal('');
  const [description, setDescription] = createSignal('');
  const [link, setLink] = createSignal('');
  const [creating, setCreating] = createSignal(false);
  const [createError, setCreateError] = createSignal('');
  const [showApiKey, setShowApiKey] = createSignal<string | null>(null);

  const handleCreate = async (e: Event) => {
    e.preventDefault();
    if (!title() || !description() || !link()) return;

    setCreating(true);
    setCreateError('');

    const result = await createFeedFn({
      data: { description: description(), link: link(), title: title() },
    });

    if (result.success && result.data) {
      setShowApiKey(result.data.apiKey);
      setTitle('');
      setDescription('');
      setLink('');
      refetch();
    } else {
      setCreateError('Failed to create feed');
    }
    setCreating(false);
  };

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Feed Manager</h1>
      <p style={{ color: '#6b7280', marginBottom: '32px' }}>Create and manage your RSS feeds</p>

      <Show when={showApiKey()}>
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            marginBottom: '24px',
            padding: '16px',
          }}
        >
          <p style={{ color: '#166534', fontWeight: 'bold', margin: '0 0 8px' }}>
            Feed created! Your API Key:
          </p>
          <code
            style={{
              background: '#fff',
              borderRadius: '4px',
              display: 'block',
              fontSize: '14px',
              marginBottom: '8px',
              padding: '8px 12px',
              wordBreak: 'break-all',
            }}
          >
            {showApiKey()}
          </code>
          <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>
            Copy this key now. Use it in the X-API-Key header to add items.
          </p>
        </div>
      </Show>

      <form
        onSubmit={handleCreate}
        style={{
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          marginBottom: '32px',
          padding: '20px',
        }}
      >
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Create Feed</h2>

        <div style={{ marginBottom: '12px' }}>
          <label
            style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}
            for="title"
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title()}
            onInput={(e) => setTitle(e.currentTarget.value)}
            style={inputStyle}
            placeholder="My Blog"
            required
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label
            style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}
            for="description"
          >
            Description
          </label>
          <input
            id="description"
            type="text"
            value={description()}
            onInput={(e) => setDescription(e.currentTarget.value)}
            style={inputStyle}
            placeholder="Latest posts from my blog"
            required
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label
            style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}
            for="link"
          >
            Link
          </label>
          <input
            id="link"
            type="url"
            value={link()}
            onInput={(e) => setLink(e.currentTarget.value)}
            style={inputStyle}
            placeholder="https://example.com"
            required
          />
        </div>

        <Show when={createError()}>
          <div
            style={{
              background: '#fef2f2',
              borderRadius: '6px',
              color: '#dc2626',
              fontSize: '14px',
              marginBottom: '12px',
              padding: '8px 12px',
            }}
          >
            {createError()}
          </div>
        </Show>

        <button
          type="submit"
          disabled={creating()}
          style={{
            background: '#2563eb',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            cursor: creating() ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            opacity: creating() ? 0.7 : 1,
            padding: '8px 20px',
          }}
        >
          {creating() ? 'Creating...' : 'Create Feed'}
        </button>
      </form>

      <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Your Feeds</h2>

      <Show when={feeds.loading}>
        <p style={{ color: '#6b7280' }}>Loading...</p>
      </Show>

      <Show when={feeds()?.length === 0}>
        <p style={{ color: '#9ca3af' }}>No feeds yet. Create your first one above.</p>
      </Show>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <For each={feeds()}>
          {(feed) => (
            <div
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                padding: '16px',
              }}
              onClick={() => router.navigate({ params: { id: feed.id }, to: '/admin/feed/$id' })}
            >
              <div
                style={{
                  alignItems: 'flex-start',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      margin: '0 0 4px',
                    }}
                  >
                    {feed.title}
                  </h3>
                  <p
                    style={{
                      color: '#6b7280',
                      fontSize: '14px',
                      margin: '0 0 8px',
                    }}
                  >
                    {feed.description}
                  </p>
                </div>
                <span
                  style={{
                    color: '#2563eb',
                    fontSize: '13px',
                  }}
                >
                  View →
                </span>
              </div>
              <div style={{ color: '#9ca3af', display: 'flex', fontSize: '13px', gap: '16px' }}>
                <span>{new URL(feed.link).hostname}</span>
                <span>Updated: {new Date(feed.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  );
};

const inputStyle = {
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  boxSizing: 'border-box' as const,
  fontSize: '14px',
  padding: '8px 12px',
  width: '100%',
};
