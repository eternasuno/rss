import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/solid-router';
import * as Solid from 'solid-js';
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
  component: RootComponent,
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { content: 'width=device-width, initial-scale=1', name: 'viewport' },
      { title: 'RSS Feed Manager' },
    ],
  }),
});
