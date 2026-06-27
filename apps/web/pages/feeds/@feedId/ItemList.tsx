export function ItemList({
  items,
}: {
  items: Array<{ id: string; title: string; createdAt: string }>;
}) {
  if (items.length === 0) return <p class="text-base-content/70">No items yet.</p>;
  return (
    <ul class="space-y-2">
      {items.map((item) => (
        <li class="card bg-base-100">
          <div class="card-body py-3">
            <span>{item.title}</span>
            <span class="text-sm text-base-content/60">
              {new Date(item.createdAt).toLocaleDateString()}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
