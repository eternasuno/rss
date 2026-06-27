import { For, Show } from 'solid-js';

export function ItemList({
  items,
}: {
  items: Array<{ id: string; title: string; createdAt: string }>;
}) {
  return (
    <Show when={items.length > 0} fallback={<p class="text-base-content/70">No items yet.</p>}>
      <ul class="space-y-2">
        <For each={items}>
          {(item) => (
            <li class="card bg-base-100">
              <div class="card-body py-3">
                <span>{item.title}</span>
                <span class="text-sm text-base-content/60">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
            </li>
          )}
        </For>
      </ul>
    </Show>
  );
}
