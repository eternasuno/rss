import { createResource, createSignal, Show } from 'solid-js';
import { usePageContext } from 'vike-solid/usePageContext';
import { CreateFeedForm } from './FeedForm';
import { type Feed, FeedList } from './FeedList';
import { HeroSection } from './HeroSection';

async function createFeedRequest({
  title,
  description,
  link,
}: {
  title: string;
  description: string;
  link: string;
}) {
  const res = await fetch('/api/feeds', {
    body: JSON.stringify({ data: { description, link, title } }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });
  if (!res.ok) {
    const data = await res.json();
    return { error: data.message || 'Failed to create feed', ok: false };
  }
  return { ok: true };
}

async function handleCreateFeed({
  e,
  title,
  description,
  link,
  setTitle,
  setDescription,
  setLink,
  setCreating,
  setError,
  refetch,
}: {
  e: Event;
  title: () => string;
  description: () => string;
  link: () => string;
  setTitle: (v: string) => void;
  setDescription: (v: string) => void;
  setLink: (v: string) => void;
  setCreating: (v: boolean) => void;
  setError: (v: string) => void;
  refetch: () => void;
}) {
  e.preventDefault();
  setCreating(true);
  setError('');
  const result = await createFeedRequest({
    description: description(),
    link: link(),
    title: title(),
  });
  if (!result.ok) {
    setError(result.error || 'Failed');
    setCreating(false);
    return;
  }
  setTitle('');
  setDescription('');
  setLink('');
  setCreating(false);
  refetch();
}

export default function IndexPage() {
  const ctx = usePageContext();

  if (ctx.user) {
    return <AuthenticatedView />;
  }

  return <HeroSection />;
}

function AuthenticatedView() {
  const [feeds, { refetch }] = createResource<Feed[]>(() =>
    fetch('/api/feeds').then((r) => r.json())
  );
  const [title, setTitle] = createSignal('');
  const [description, setDescription] = createSignal('');
  const [link, setLink] = createSignal('');
  const [creating, setCreating] = createSignal(false);
  const [error, setError] = createSignal('');
  const handleCreate = (e: Event) =>
    handleCreateFeed({
      description,
      e,
      link,
      refetch,
      setCreating,
      setDescription,
      setError,
      setLink,
      setTitle,
      title,
    });

  return (
    <>
      <CreateFeedForm
        title={title()}
        setTitle={setTitle}
        description={description()}
        setDescription={setDescription}
        link={link()}
        setLink={setLink}
        error={error()}
        creating={creating()}
        onSubmit={handleCreate}
      />
      <h2 class="text-2xl font-bold mb-4">Your Feeds</h2>
      <Show
        when={feeds()?.length}
        fallback={<p class="text-base-content/70">No feeds yet. Create one above.</p>}
      >
        <FeedList feeds={feeds() ?? []} />
      </Show>
    </>
  );
}
