import { Title } from '@solidjs/meta';
import { useParams } from '@solidjs/router';
import { createQuery } from '@tanstack/solid-query';
import { createSignal, For, Show } from 'solid-js';
import { AppLayout } from '../components/AppLayout';
import { AuthGuard } from '../components/AuthGuard';
import { CreateItemForm } from '../components/CreateItemForm';
import { type Item, ItemCard } from '../components/ItemCard';

export function FeedDetail() {
  const params = useParams();
  const feedId = () => params.id ?? '';
  const [copied, setCopied] = createSignal(false);

  const feedQuery = createQuery(() => ({
    queryFn: async () => {
      const res = await fetch(`/api/feeds/${feedId()}`);
      if (!res.ok) throw new Error('Failed to fetch feed');
      return res.json() as Promise<{
        id: string;
        title: string;
        description: string;
        link: string;
        createdAt?: string;
      }>;
    },
    queryKey: ['feeds', feedId()],
    suspense: false,
  }));

  const rssUrl = () => `${window.location.origin}/rss/${feedId()}.xml`;

  const copyRssUrl = async () => {
    try {
      await navigator.clipboard.writeText(rssUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  return (
    <AuthGuard>
      <AppLayout>
        <Title>{feedQuery.data?.title ?? 'Feed 详情'} - RSS Reader</Title>

        <Show when={feedQuery.data} fallback={<div class="text-center py-8">加载中...</div>}>
          {(feed) => (
            <>
              <div class="card bg-base-100 shadow-sm mb-6">
                <div class="card-body">
                  <h1 class="card-title text-2xl">{feed().title}</h1>
                  <p class="text-base-content/70 mt-2">{feed().description}</p>

                  <div class="flex items-center gap-2 mt-4">
                    <input
                      type="text"
                      value={rssUrl()}
                      readOnly
                      class="input input-bordered flex-1 text-sm"
                    />
                    <button onClick={copyRssUrl} type="button" class="btn btn-outline btn-sm">
                      {copied() ? '已复制!' : '复制'}
                    </button>
                  </div>
                </div>
              </div>

              <ItemsSection feedId={feedId()} />
            </>
          )}
        </Show>
      </AppLayout>
    </AuthGuard>
  );
}

function ItemsSection(props: { feedId: string }) {
  const itemsQuery = createQuery(() => ({
    queryFn: async () => {
      const res = await fetch(`/api/feeds/${props.feedId}/items`);
      if (!res.ok) throw new Error('Failed to fetch items');
      return res.json() as Promise<Item[]>;
    },
    queryKey: ['feeds', props.feedId, 'items'],
    suspense: false,
  }));

  return (
    <div>
      <h2 class="text-xl font-bold mb-4">条目</h2>
      <CreateItemForm feedId={props.feedId} />

      <Show when={itemsQuery.data} fallback={<div class="text-center py-4">加载中...</div>}>
        {(items) => (
          <Show
            when={items().length > 0}
            fallback={<p class="text-base-content/50 text-center py-4">暂无条目</p>}
          >
            <For each={items()}>{(item) => <ItemCard item={item} />}</For>
          </Show>
        )}
      </Show>
    </div>
  );
}
