import { A } from '@solidjs/router';

export interface Feed {
  id: string;
  title: string;
  description: string;
  link: string;
  extraData?: Record<string, unknown>;
  createdAt?: string;
}

export function FeedCard(props: { feed: Feed }) {
  return (
    <div class="card bg-base-100 shadow-sm mb-4">
      <div class="card-body">
        <h2 class="card-title">
          <A href={`/feeds/${props.feed.id}`} class="hover:text-primary transition-colors">
            {props.feed.title}
          </A>
        </h2>
        <p class="text-base-content/70">{props.feed.description}</p>
      </div>
    </div>
  );
}
