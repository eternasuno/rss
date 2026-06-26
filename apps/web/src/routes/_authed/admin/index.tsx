import { createFileRoute, useRouter } from '@tanstack/solid-router';
import { createResource, createSignal, For, Show } from 'solid-js';
import { createFeedFn, listFeedsFn } from '../../../server/feeds';
import { listApiKeysFn, createApiKeyFn, deleteApiKeyFn } from '../../../lib/auth-utils';

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

  // API key state
  const [apiKeys, { refetch: refetchKeys }] = createResource(() => listApiKeysFn());
  const [showKeys, setShowKeys] = createSignal(false);
  const [keyName, setKeyName] = createSignal('');
  const [creatingKey, setCreatingKey] = createSignal(false);
  const [newKey, setNewKey] = createSignal<{ key: string; name: string } | null>(null);

  const handleCreate = async (e: Event) => {
    e.preventDefault();
    if (!title() || !description() || !link()) return;

    setCreating(true);
    setCreateError('');

    const result = await createFeedFn({
      data: { description: description(), link: link(), title: title() },
    });

    if (result.success && result.data) {
      setTitle('');
      setDescription('');
      setLink('');
      refetch();
    } else {
      setCreateError('Failed to create feed');
    }
    setCreating(false);
  };

  const handleCreateApiKey = async () => {
    if (!keyName()) return;
    setCreatingKey(true);
    try {
      const result = await createApiKeyFn({ data: { name: keyName() } });
      if (result) {
        setNewKey({ key: result.key ?? '', name: result.name ?? '' });
        setKeyName('');
        refetchKeys();
      }
    } catch {
      // ignore
    }
    setCreatingKey(false);
  };

  const handleDeleteApiKey = async (keyId: string) => {
    await deleteApiKeyFn({ data: { keyId } });
    refetchKeys();
  };

  return (
    <div>
      <h1 style={{ 'font-size': '24px', 'font-weight': 'bold', 'margin-bottom': '8px' }}>
        Feed Manager
      </h1>
      <p style={{ color: '#6b7280', 'margin-bottom': '32px' }}>
        Create and manage your RSS feeds
      </p>

      {/* API Key Section */}
      <div
        style={{
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          'border-radius': '8px',
          'margin-bottom': '24px',
          padding: '16px',
        }}
      >
        <button
          type="button"
          onClick={() => setShowKeys(!showKeys)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            'font-size': '16px',
            'font-weight': '600',
            padding: '0',
            width: '100%',
            'text-align': 'left',
          }}
        >
          {showKeys() ? '▼' : '▶'} API Keys
        </button>

        <Show when={showKeys}>
          <div style={{ 'margin-top': '16px' }}>
            <Show when={newKey()}>
              {(nk) => (
                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    'border-radius': '8px',
                    'margin-bottom': '16px',
                    padding: '16px',
                  }}
                >
                  <p style={{ color: '#166534', 'font-weight': 'bold', margin: '0 0 8px' }}>
                    API Key created: {nk().name}
                  </p>
                  <code
                    style={{
                      background: '#fff',
                      'border-radius': '4px',
                      display: 'block',
                      'font-size': '14px',
                      'margin-bottom': '8px',
                      padding: '8px 12px',
                      'word-break': 'break-all',
                    }}
                  >
                    {nk().key}
                  </code>
                  <p style={{ color: '#6b7280', 'font-size': '12px', margin: 0 }}>
                    Copy this key now. You won't be able to see it again.
                  </p>
                  <button
                    type="button"
                    onClick={() => setNewKey(null)}
                    style={{
                      background: '#fff',
                      border: '1px solid #d1d5db',
                      'border-radius': '4px',
                      cursor: 'pointer',
                      'font-size': '12px',
                      'margin-top': '8px',
                      padding: '4px 12px',
                    }}
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </Show>

            {/* Create new key */}
            <div style={{ display: 'flex', gap: '8px', 'margin-bottom': '12px' }}>
              <input
                type="text"
                value={keyName()}
                onInput={(e) => setKeyName(e.currentTarget.value)}
                placeholder="Key name (e.g. Production)"
                style={{
                  border: '1px solid #d1d5db',
                  'border-radius': '6px',
                  'box-sizing': 'border-box',
                  flex: 1,
                  'font-size': '14px',
                  padding: '8px 12px',
                }}
              />
              <button
                type="button"
                disabled={creatingKey() || !keyName()}
                onClick={handleCreateApiKey}
                style={{
                  background: '#2563eb',
                  border: 'none',
                  'border-radius': '6px',
                  color: 'white',
                  cursor: creatingKey() ? 'not-allowed' : 'pointer',
                  'font-size': '14px',
                  opacity: creatingKey() ? 0.7 : 1,
                  padding: '8px 16px',
                  'white-space': 'nowrap',
                }}
              >
                {creatingKey() ? 'Creating...' : 'Create Key'}
              </button>
            </div>

            {/* Key list */}
            <Show when={apiKeys.loading}>
              <p style={{ color: '#6b7280', 'font-size': '14px' }}>Loading keys...</p>
            </Show>

            <Show when={apiKeys()?.length === 0}>
              <p style={{ color: '#9ca3af', 'font-size': '14px' }}>No API keys yet.</p>
            </Show>

            <For each={apiKeys()}>
              {(key) => (
                <div
                  style={{
                    display: 'flex',
                    'align-items': 'center',
                    'justify-content': 'space-between',
                    padding: '8px 0',
                    'border-bottom': '1px solid #e5e7eb',
                  }}
                >
                  <div>
                    <span style={{ 'font-size': '14px', 'font-weight': '500' }}>{key.name}</span>
                    <span style={{ color: '#9ca3af', 'font-size': '12px', 'margin-left': '8px' }}>
                      Created: {new Date(key.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteApiKey(key.id)}
                    style={{
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      'border-radius': '4px',
                      color: '#dc2626',
                      cursor: 'pointer',
                      'font-size': '12px',
                      padding: '4px 12px',
                    }}
                  >
                    Revoke
                  </button>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>

      {/* Create Feed Form */}
      <form
        onSubmit={handleCreate}
        style={{
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          'border-radius': '8px',
          'margin-bottom': '32px',
          padding: '20px',
        }}
      >
        <h2 style={{ 'font-size': '18px', 'font-weight': '600', 'margin-bottom': '16px' }}>
          Create Feed
        </h2>

        <div style={{ 'margin-bottom': '12px' }}>
          <label
            for="title"
            style={{ display: 'block', 'font-size': '14px', 'font-weight': '500', 'margin-bottom': '4px' }}
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title()}
            onInput={(e) => setTitle(e.currentTarget.value)}
            style={{
              border: '1px solid #d1d5db',
              'border-radius': '6px',
              'box-sizing': 'border-box',
              'font-size': '14px',
              padding: '8px 12px',
              width: '100%',
            }}
            placeholder="My Blog"
            required
          />
        </div>

        <div style={{ 'margin-bottom': '12px' }}>
          <label
            for="description"
            style={{ display: 'block', 'font-size': '14px', 'font-weight': '500', 'margin-bottom': '4px' }}
          >
            Description
          </label>
          <input
            id="description"
            type="text"
            value={description()}
            onInput={(e) => setDescription(e.currentTarget.value)}
            style={{
              border: '1px solid #d1d5db',
              'border-radius': '6px',
              'box-sizing': 'border-box',
              'font-size': '14px',
              padding: '8px 12px',
              width: '100%',
            }}
            placeholder="Latest posts from my blog"
            required
          />
        </div>

        <div style={{ 'margin-bottom': '12px' }}>
          <label
            for="link"
            style={{ display: 'block', 'font-size': '14px', 'font-weight': '500', 'margin-bottom': '4px' }}
          >
            Link
          </label>
          <input
            id="link"
            type="url"
            value={link()}
            onInput={(e) => setLink(e.currentTarget.value)}
            style={{
              border: '1px solid #d1d5db',
              'border-radius': '6px',
              'box-sizing': 'border-box',
              'font-size': '14px',
              padding: '8px 12px',
              width: '100%',
            }}
            placeholder="https://example.com"
            required
          />
        </div>

        <Show when={createError()}>
          <div
            style={{
              background: '#fef2f2',
              'border-radius': '6px',
              color: '#dc2626',
              'font-size': '14px',
              'margin-bottom': '12px',
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
            'border-radius': '6px',
            color: 'white',
            cursor: creating() ? 'not-allowed' : 'pointer',
            'font-size': '14px',
            'font-weight': '500',
            opacity: creating() ? 0.7 : 1,
            padding: '8px 20px',
          }}
        >
          {creating() ? 'Creating...' : 'Create Feed'}
        </button>
      </form>

      <h2 style={{ 'font-size': '18px', 'font-weight': '600', 'margin-bottom': '16px' }}>Your Feeds</h2>

      <Show when={feeds.loading}>
        <p style={{ color: '#6b7280' }}>Loading...</p>
      </Show>

      <Show when={feeds()?.length === 0}>
        <p style={{ color: '#9ca3af' }}>No feeds yet. Create your first one above.</p>
      </Show>

      <div style={{ display: 'flex', 'flex-direction': 'column', gap: '12px' }}>
        <For each={feeds()}>
          {(feed) => (
            <div
              style={{
                border: '1px solid #e5e7eb',
                'border-radius': '8px',
                cursor: 'pointer',
                padding: '16px',
              }}
              onClick={() => router.navigate({ params: { id: feed.id }, to: '/admin/feed/$id' })}
            >
              <div
                style={{
                  'align-items': 'flex-start',
                  display: 'flex',
                  'justify-content': 'space-between',
                }}
              >
                <div>
                  <h3
                    style={{
                      'font-size': '16px',
                      'font-weight': '600',
                      margin: '0 0 4px',
                    }}
                  >
                    {feed.title}
                  </h3>
                  <p
                    style={{
                      color: '#6b7280',
                      'font-size': '14px',
                      margin: '0 0 8px',
                    }}
                  >
                    {feed.description}
                  </p>
                </div>
                <span
                  style={{
                    color: '#2563eb',
                    'font-size': '13px',
                  }}
                >
                  View →
                </span>
              </div>
              <div style={{ color: '#9ca3af', display: 'flex', 'font-size': '13px', gap: '16px' }}>
                <span>{new URL(feed.link).hostname}</span>
                <span>Created: {new Date(feed.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  );
};
