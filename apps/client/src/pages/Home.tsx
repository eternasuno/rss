import { Title } from '@solidjs/meta';
import { AppLayout } from '../components/AppLayout';
import { AuthGuard } from '../components/AuthGuard';
import { signOut, useSession } from '../lib/auth-client';

export function Home() {
  const session = useSession();

  return (
    <AuthGuard>
      <AppLayout>
        <Title>RSS Reader - 首页</Title>
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body">
            <h1 class="card-title text-2xl">欢迎回来，{session()?.data?.user?.name ?? '用户'}</h1>
            <p class="text-base-content/70">{session()?.data?.user?.email ?? ''}</p>
            <div class="card-actions mt-4">
              <button onClick={() => signOut()} type="button" class="btn btn-outline btn-sm">
                退出登录
              </button>
            </div>
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
