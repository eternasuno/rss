export function Breadcrumbs({ feedTitle }: { feedTitle: string }) {
  return (
    <div class="breadcrumbs text-sm mb-4">
      <ul>
        <li>
          <a href="/">Feeds</a>
        </li>
        <li>{feedTitle}</li>
      </ul>
    </div>
  );
}

export function FeedInfo({
  feed,
  feedId,
}: {
  feed: { title: string; description: string; link: string };
  feedId: string;
}) {
  return (
    <div class="card bg-base-100 shadow-xl mb-6">
      <div class="card-body">
        <h1 class="card-title text-2xl">{feed.title}</h1>
        <p>{feed.description}</p>
        <a href={feed.link} class="link" target="_blank" rel="noreferrer">
          {feed.link}
        </a>
        <div class="card-actions">
          <a href={`/api/feeds/${feedId}/xml`} class="btn btn-sm">
            RSS XML
          </a>
        </div>
      </div>
    </div>
  );
}
