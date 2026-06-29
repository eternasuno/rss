import { Title } from '@solidjs/meta';
import { AppLayout } from '../components/AppLayout';
import { LoginForm } from '../components/LoginForm';

export default function Login() {
  return (
    <AppLayout>
      <Title>登录 - RSS Reader</Title>
      <LoginForm />
    </AppLayout>
  );
}
