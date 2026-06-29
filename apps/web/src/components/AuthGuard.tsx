import { Navigate, useLocation } from '@solidjs/router';
import { type JSX, Show } from 'solid-js';
import { useSession } from '../lib/auth-client';

export function AuthGuard(props: { children: JSX.Element }) {
  const session = useSession();
  const location = useLocation();

  return (
    <Show
      when={!session().isPending}
      fallback={
        <div class="flex min-h-screen items-center justify-center">
          <span class="loading loading-spinner loading-lg text-primary" />
        </div>
      }
    >
      <Show
        when={session()?.data}
        fallback={<Navigate href={`/login?redirect=${encodeURIComponent(location.pathname)}`} />}
      >
        {props.children}
      </Show>
    </Show>
  );
}
