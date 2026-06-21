import * as Solid from 'solid-js';
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from '@tanstack/solid-router';
import { HydrationScript } from 'solid-js/web';

const RootDocument = (props: { children: Solid.JSX.Element }) => (
  <html>
    <head>
      <HydrationScript />
      <HeadContent />
    </head>
    <body>
      <Solid.Suspense>{props.children}</Solid.Suspense>
      <Scripts />
    </body>
  </html>
);

const RootComponent = () => (
  <RootDocument>
    <Outlet />
  </RootDocument>
);

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'RSS Feed Manager' },
    ],
  }),
  component: RootComponent,
});
