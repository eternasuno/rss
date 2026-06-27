export type Feed = {
  id: string;
  title: string;
  description: string;
  link: string;
  createdAt: string;
};

export function FeedList({ feeds }: { feeds: Feed[] }) {
  if (feeds.length === 0) return null;
  return (
    <div class="grid gap-4 grid-cols-1 md:grid-cols-2">
      {feeds.map((feed) => (
        <a
          href={`/feeds/${feed.id}`}
          class="card bg-base-100 shadow hover:shadow-md transition-shadow"
        >
          <div class="card-body">
            <h3 class="card-title">{feed.title}</h3>
            <p>{feed.description}</p>
            <div class="card-actions">
              <a class="link link-hover text-sm" href={`/api/feeds/${feed.id}/xml`}>
                RSS XML
              </a>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
