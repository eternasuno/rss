import { Title } from '@solidjs/meta';
import { createQuery } from '@tanstack/solid-query';
import { For, Show } from 'solid-js';
import { AppLayout } from '../components/AppLayout';
import { AuthGuard } from '../components/AuthGuard';
import { CreateFeedForm } from '../components/CreateFeedForm';
import { type Feed, FeedCard } from '../components/FeedCard';

export function Home() {
  const feedsQuery = createQuery(() => ({
    queryFn: async () => {
      const res = await fetch('/api/feeds');
      if (!res.ok) throw new Error('Failed to fetch feeds');
      return res.json() as Promise<Feed[]>;
    },
    queryKey: ['feeds'],
    staleTime: 30_000,
    suspense: false,
  }));

  return (
    <AuthGuard>
      <AppLayout>
        <Title>RSS Reader - 管理 Feeds</Title>

        <div class="mb-6">
          <h1 class="text-2xl font-bold">管理 Feeds</h1>
        </div>

        <CreateFeedForm />

        <Show when={feedsQuery.data} fallback={<div class="text-center py-8">加载中...</div>}>
          {(feeds) => (
            <Show
              when={feeds().length > 0}
              fallback={
                <p class="text-base-content/50 text-center py-8">暂无 Feed，创建一个吧</p>
              }
            >
              <For each={feeds()}>{(feed) => <FeedCard feed={feed} />}</For>
            </Show>
          )}
        </Show>
      </AppLayout>
    </AuthGuard>
  );
}
