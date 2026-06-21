import { createFileRoute } from '@tanstack/solid-router';
import { For, Show, createResource, createSignal } from 'solid-js';
import { getFeedDetailFn, regenerateXmlFn } from '../../server/feeds';

export const Route = createFileRoute('/_authed/admin/feed/$id')({
  component: FeedDetailPage,
});

const FeedDetailPage = () => {
  const params = Route.useParams();
  const [feedData, { refetch }] = createResource(
    () => params().id,
    (id) => getFeedDetailFn({ data: { id } }),
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
            <p style={{ color: '#6b7280', marginBottom: '32px' }}>
              {data().feed.description}
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
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
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Items</h2>
              <button
                onClick={handleRegenerate}
                disabled={regenerating()}
                style={{
                  padding: '6px 16px',
                  background: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '13px',
                  cursor: regenerating() ? 'not-allowed' : 'pointer',
                }}
              >
                {regenerating() ? 'Regenerating...' : 'Regenerate XML'}
              </button>
            </div>

            <Show when={data().items.length === 0}>
              <div
                style={{
                  textAlign: 'center',
                  padding: '48px 0',
                  color: '#9ca3af',
                }}
              >
                <p style={{ fontSize: '16px', marginBottom: '8px' }}>No items yet</p>
                <p style={{ fontSize: '14px' }}>
                  Add items via:{' '}
                  <code
                    style={{
                      background: '#f3f4f6',
                      padding: '2px 6px',
                      borderRadius: '4px',
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
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ fontWeight: '500', fontSize: '14px' }}>
                        {item.title}
                      </span>
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
    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>
      {props.label}
    </div>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
      }}
    >
      <code
        style={{
          fontSize: '13px',
          wordBreak: 'break-all',
          flex: 1,
        }}
      >
        {props.value}
      </code>
      {props.onCopy && (
        <button
          onClick={props.onCopy}
          style={{
            padding: '4px 12px',
            background: props.copied ? '#f0fdf4' : '#fff',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
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
            padding: '4px 12px',
            background: '#fff',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            whiteSpace: 'nowrap',
          }}
        >
          Copy
        </button>
      )}
    </div>
  </div>
);
