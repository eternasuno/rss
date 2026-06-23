import { createFileRoute } from '@tanstack/solid-router';
import { createResource, createSignal, For, Show } from 'solid-js';
import { getFeedDetailFn, regenerateXmlFn } from '../../server/feeds';

export const Route = createFileRoute('/_authed/admin/feed/$id')({
  component: FeedDetailPage,
});

const FeedDetailPage = () => {
  const params = Route.useParams();
  const [feedData, { refetch }] = createResource(
    () => params().id,
    (id) => getFeedDetailFn({ data: { id } })
  );
  const [copied, setCopied] = createSignal(false);
  const [regenerating, setRegenerating] = createSignal(false);

  const handleCopyApiKey = async () => {
    const data = feedData();
    if (!data?.apiKey) return;
    await navigator.clipboard.writeText(data.apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    await regenerateXmlFn({ data: { feedId: params().id } });
    setRegenerating(false);
  };

  return (
    <div>
      <Show when={feedData.loading}>
        <p style={{ color: '#6b7280' }}>Loading...</p>
      </Show>

      <Show when={feedData()}>
        {(data) => (
          <>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
              {data().feed.title}
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '32px' }}>{data().feed.description}</p>

            <div
              style={{
                display: 'grid',
                gap: '16px',
                gridTemplateColumns: '1fr 1fr',
                marginBottom: '32px',
              }}
            >
              <InfoCard
                label="RSS Feed URL"
                value={`${window.location.origin}/feed/${data().feed.id}`}
                copyText={`${window.location.origin}/feed/${data().feed.id}`}
              />
              <InfoCard
                label="API Key"
                value={data().apiKey || 'No key'}
                onCopy={handleCopyApiKey}
                copied={copied()}
              />
            </div>

            <div
              style={{
                'align-items': 'center',
                display: 'flex',
                'justify-content': 'space-between',
                'margin-bottom': '16px',
              }}
            >
              <h2 style={{ 'font-size': '18px', 'font-weight': '600', margin: 0 }}>Items</h2>
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={regenerating()}
                style={{
                  background: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: regenerating() ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  padding: '6px 16px',
                }}
              >
                {regenerating() ? 'Regenerating...' : 'Regenerate XML'}
              </button>
            </div>

            <Show when={data().items.length === 0}>
              <div
                style={{
                  color: '#9ca3af',
                  padding: '48px 0',
                  textAlign: 'center',
                }}
              >
                <p style={{ fontSize: '16px', marginBottom: '8px' }}>No items yet</p>
                <p style={{ fontSize: '14px' }}>
                  Add items via:{' '}
                  <code
                    style={{
                      background: '#f3f4f6',
                      borderRadius: '4px',
                      padding: '2px 6px',
                    }}
                  >
                    POST /api/{data().feed.id}/items
                  </code>
                </p>
              </div>
            </Show>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <For each={data().items}>
                {(item) => (
                  <div
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '12px 16px',
                    }}
                  >
                    <div
                      style={{
                        alignItems: 'center',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.title}</span>
                      <span style={{ color: '#9ca3af', fontSize: '12px' }}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </>
        )}
      </Show>
    </div>
  );
};

const InfoCard = (props: {
  label: string;
  value: string;
  copyText?: string;
  onCopy?: () => void;
  copied?: boolean;
}) => (
  <div
    style={{
      background: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
    }}
  >
    <div style={{ color: '#6b7280', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>
      {props.label}
    </div>
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        gap: '8px',
        justifyContent: 'space-between',
      }}
    >
      <code
        style={{
          flex: 1,
          fontSize: '13px',
          wordBreak: 'break-all',
        }}
      >
        {props.value}
      </code>
      {props.onCopy && (
        <button
          onClick={props.onCopy}
          style={{
            background: props.copied ? '#f0fdf4' : '#fff',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            padding: '4px 12px',
            whiteSpace: 'nowrap',
          }}
        >
          {props.copied ? 'Copied!' : 'Copy'}
        </button>
      )}
      {props.copyText && (
        <button
          onClick={() => {
            navigator.clipboard.writeText(props.copyText || props.value);
          }}
          style={{
            background: '#fff',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            padding: '4px 12px',
            whiteSpace: 'nowrap',
          }}
        >
          Copy
        </button>
      )}
    </div>
  </div>
);
