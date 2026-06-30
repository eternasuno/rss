import { Title } from '@solidjs/meta';
import { A } from '@solidjs/router';
import { AppLayout } from '../components/AppLayout';

export function NotFound() {
  return (
    <AppLayout>
      <Title>404 - 页面未找到</Title>
      <div class="flex items-center justify-center py-20">
        <div class="text-center">
          <h1 class="text-6xl font-bold text-base-content/20">404</h1>
          <p class="mt-4 text-lg text-base-content/60">页面不存在</p>
          <A href="/" class="btn btn-primary mt-6">
            返回首页
          </A>
        </div>
      </div>
    </AppLayout>
  );
}
