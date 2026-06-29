import { Title } from '@solidjs/meta';
import { createForm } from '@tanstack/solid-form';
import { createSignal } from 'solid-js';
import { signIn } from '../lib/auth-client';
import { FormField } from '../components/FormField';

export default function Login() {
  const [submitError, setSubmitError] = createSignal('');

  const form = createForm(() => ({
    defaultValues: { email: '', password: '' },
    onSubmit: async ({ value }) => {
      setSubmitError('');
      const { error } = await signIn.email({ email: value.email, password: value.password });
      if (error) {
        setSubmitError(error.message ?? 'Login failed');
        return;
      }
      window.location.href = '/dashboard';
    },
  }));

  return (
    <>
      <Title>Login</Title>
      <h1>Login</h1>
      <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(); }}>
        <form.Field name="email">
          {(field) => <FormField field={field()} type="email" placeholder="Email" />}
        </form.Field>
        <form.Field name="password">
          {(field) => <FormField field={field()} type="password" placeholder="Password" />}
        </form.Field>
        <form.Subscribe selector={(s) => ({ canSubmit: s.canSubmit, isSubmitting: s.isSubmitting })}>
          {(state) => (
            <button type="submit" disabled={!state().canSubmit}>
              {state().isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          )}
        </form.Subscribe>
        {submitError() && <p role="alert">{submitError()}</p>}
      </form>
      <p>Don't have an account? <a href="/register">Register</a></p>
    </>
  );
}
