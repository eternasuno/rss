import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/solid-router';
import { HydrationScript } from 'solid-js/web';
import '../global.css';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ],
    title: 'RSS Feed Manager',
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <HydrationScript />
      </head>
      <body>
        <HeadContent />
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
