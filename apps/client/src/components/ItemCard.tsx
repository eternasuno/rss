import { Show } from 'solid-js';

export interface Item {
  id: string;
  feedId: string;
  title: string;
  pubDate?: string | number;
  extraData?: {
    description?: string;
    link?: string;
    author?: string;
  };
}

function formatDate(value: string | number | undefined): string {
  if (!value) return '';
  const date = typeof value === 'number' ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('zh-CN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function ItemCard(props: { item: Item }) {
  return (
    <div class="card bg-base-100 shadow-sm mb-2">
      <div class="card-body py-4">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0 flex-1">
            <h3 class="font-semibold truncate">{props.item.title}</h3>
            <Show when={props.item.extraData?.description}>
              <p class="text-sm text-base-content/70 mt-1 line-clamp-2">
                {props.item.extraData?.description}
              </p>
            </Show>
          </div>
          <Show when={props.item.pubDate}>
            <span class="text-xs text-base-content/50 shrink-0">
              {formatDate(props.item.pubDate)}
            </span>
          </Show>
        </div>
      </div>
    </div>
  );
}
