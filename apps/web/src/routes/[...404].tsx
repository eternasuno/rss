import { Title } from '@solidjs/meta';
import { HttpStatusCode } from '@solidjs/start';
import { AppLayout } from '../components/AppLayout';

export default function NotFound() {
  return (
    <AppLayout>
      <Title>404 - 页面未找到</Title>
      <HttpStatusCode code={404} />
      <div class="flex items-center justify-center py-20">
        <div class="text-center">
          <h1 class="text-6xl font-bold text-base-content/20">404</h1>
          <p class="mt-4 text-lg text-base-content/60">页面不存在</p>
          <a href="/" class="btn btn-primary mt-6">
            返回首页
          </a>
        </div>
      </div>
    </AppLayout>
  );
}
