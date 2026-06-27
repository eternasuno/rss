import type { JSX } from 'solid-js';
import { usePageContext } from 'vike-solid/usePageContext';

import './tailwind.css';

function AuthNav() {
  const ctx = usePageContext();

  if (!ctx.user) {
    return (
      <a href="/login" class="btn btn-ghost">
        Sign In
      </a>
    );
  }

  return (
    <div class="dropdown dropdown-end">
      <button type="button" class="avatar placeholder cursor-pointer btn btn-ghost btn-circle">
        <div class="bg-neutral text-neutral-content w-10 rounded-full">
          <span>{(ctx.user.email ?? '?')[0].toUpperCase()}</span>
        </div>
      </button>
      <ul class="menu dropdown-content z-[1] mt-2 w-52 rounded-box bg-base-100 p-2 shadow">
        <li>
          <span>{ctx.user.email}</span>
        </li>
        <li>
          <a href="/api/auth/sign-out">Sign Out</a>
        </li>
      </ul>
    </div>
  );
}

export default function Layout({ children }: { children: JSX.Element }) {
  return (
    <div class="min-h-screen bg-base-200">
      <div class="navbar bg-base-100 shadow-sm">
        <div class="flex-1">
          <a href="/" class="btn btn-ghost text-xl">
            RSS Manager
          </a>
        </div>
        <div class="flex-none">
          <AuthNav />
        </div>
      </div>
      <main class="container mx-auto p-4">{children}</main>
    </div>
  );
}
