import { A } from '@solidjs/router';
import type { JSX } from 'solid-js';

export function AuthCard(props: {
  title: string;
  subtitle: string;
  footerLink: string;
  footerText: string;
  children: JSX.Element;
}) {
  return (
    <div class="flex items-center justify-center py-12">
      <div class="card bg-base-100 shadow-sm w-full max-w-md">
        <div class="card-body">
          <h1 class="card-title text-2xl">{props.title}</h1>
          <p class="text-base-content/60">{props.subtitle}</p>
          <div class="mt-4">{props.children}</div>
          <p class="text-center text-sm text-base-content/60 mt-6">
            {props.footerText}
            <A href={props.footerLink} class="link link-primary ml-1">
              {props.footerLink === '/register' ? '立即注册' : '立即登录'}
            </A>
          </p>
        </div>
      </div>
    </div>
  );
}
