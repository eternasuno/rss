import { A } from '@solidjs/router';
import { type JSX, Show } from 'solid-js';
import { signOut, useSession } from '../lib/auth-client';

export function AppLayout(props: { children: JSX.Element }) {
  const session = useSession();

  return (
    <div class="min-h-screen bg-base-200">
      <header class="navbar bg-base-100 shadow-sm">
        <div class="navbar-start">
          <A href="/" class="btn btn-ghost text-xl font-bold tracking-tight">
            RSS Reader
          </A>
        </div>
        <div class="navbar-end">
          <Show
            when={session()?.data}
            fallback={
              <div class="flex gap-2">
                <A href="/login" class="btn btn-ghost">
                  登录
                </A>
                <A href="/register" class="btn btn-primary btn-sm">
                  注册
                </A>
              </div>
            }
          >
            <div class="flex items-center gap-3">
              <span class="text-sm text-base-content/70">
                {session()?.data?.user?.name ?? '用户'}
              </span>
              <button onClick={() => signOut()} type="button" class="btn btn-ghost btn-sm">
                退出
              </button>
            </div>
          </Show>
        </div>
      </header>
      <main class="container mx-auto px-4 py-8">{props.children}</main>
    </div>
  );
}
