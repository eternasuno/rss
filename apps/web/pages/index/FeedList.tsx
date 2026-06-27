import { For } from 'solid-js';

export type Feed = {
  createdAt: string;
  data: {
    description: string;
    link: string;
    title: string;
  };
  id: string;
  userId: string;
};

export function FeedList({ feeds }: { feeds: Feed[] }) {
  return (
    <div class="grid gap-4 grid-cols-1 md:grid-cols-2">
      <For each={feeds}>
        {(feed) => (
          <div
            class="card bg-base-100 shadow hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => window.location.assign(`/feeds/${feed.id}`)}
          >
            <div class="card-body">
              <h3 class="card-title">{feed.data.title}</h3>
              <p>{feed.data.description}</p>
              <div class="card-actions">
                <a class="link link-hover text-sm" href={`/api/feeds/${feed.id}/xml`}>
                  RSS XML
                </a>
              </div>
            </div>
          </div>
        )}
      </For>
    </div>
  );
}
