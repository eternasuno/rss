import { Title } from '@solidjs/meta';
import { AppLayout } from '../components/AppLayout';
import { RegisterForm } from '../components/RegisterForm';

export function Register() {
  return (
    <AppLayout>
      <Title>注册 - RSS Reader</Title>
      <RegisterForm />
    </AppLayout>
  );
}
