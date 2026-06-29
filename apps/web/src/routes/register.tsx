import { Title } from '@solidjs/meta';
import { createForm } from '@tanstack/solid-form';
import { createSignal } from 'solid-js';
import { signUp } from '../lib/auth-client';
import { FormField } from '../components/FormField';

export default function Register() {
  const [submitError, setSubmitError] = createSignal('');

  const form = createForm(() => ({
    defaultValues: { name: '', email: '', password: '' },
    onSubmit: async ({ value }) => {
      setSubmitError('');
      const { error } = await signUp.email(value);
      if (error) {
        setSubmitError(error.message ?? 'Registration failed');
        return;
      }
      window.location.href = '/dashboard';
    },
  }));

  return (
    <>
      <Title>Register</Title>
      <h1>Register</h1>
      <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(); }}>
        <form.Field name="name">
          {(field) => <FormField field={field()} type="text" placeholder="Name" />}
        </form.Field>
        <form.Field name="email">
          {(field) => <FormField field={field()} type="email" placeholder="Email" />}
        </form.Field>
        <form.Field name="password">
          {(field) => <FormField field={field()} type="password" placeholder="Password" />}
        </form.Field>
        <form.Subscribe selector={(s) => ({ canSubmit: s.canSubmit, isSubmitting: s.isSubmitting })}>
          {(state) => (
            <button type="submit" disabled={!state().canSubmit}>
              {state().isSubmitting ? 'Creating account...' : 'Sign Up'}
            </button>
          )}
        </form.Subscribe>
        {submitError() && <p role="alert">{submitError()}</p>}
      </form>
      <p>Already have an account? <a href="/login">Login</a></p>
    </>
  );
}
