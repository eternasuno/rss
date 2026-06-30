import { MetaProvider, Title } from '@solidjs/meta';
import { Route, Router } from '@solidjs/router';
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query';
import { ErrorBoundary, Suspense } from 'solid-js';
import { FeedDetail } from './pages/FeedDetail';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { NotFound } from './pages/NotFound';
import { Register } from './pages/Register';

import './app.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 5,
      suspense: true,
      throwOnError: true,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router
        root={(props) => (
          <MetaProvider>
            <Title>RSS Reader</Title>
            <ErrorBoundary
              fallback={<div class="p-8 text-center text-error">页面出现错误，请刷新重试</div>}
            >
              <Suspense>{props.children}</Suspense>
            </ErrorBoundary>
          </MetaProvider>
        )}
      >
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/feeds/:id" component={FeedDetail} />
        <Route path="*404" component={NotFound} />
      </Router>
    </QueryClientProvider>
  );
}
