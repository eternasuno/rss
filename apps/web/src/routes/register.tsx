import { createFileRoute, redirect, useRouter } from '@tanstack/solid-router';
import { createSignal, onMount } from 'solid-js';
import { authClient } from '../lib/auth-client';
import { checkHasUsers } from '../lib/auth-utils';

export const Route = createFileRoute('/register')({
  beforeLoad: async () => {
    const hasUsers = await checkHasUsers();
    if (hasUsers) {
      throw redirect({ to: '/login' });
    }
  },
  component: RegisterPage,
});

const RegisterPage = () => {
  const router = useRouter();
  const [name, setName] = createSignal('');
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [error, setError] = createSignal('');
  const [loading, setLoading] = createSignal(false);

  // Double-check no users exist on mount
  onMount(async () => {
    const hasUsers = await checkHasUsers();
    if (hasUsers) {
      router.navigate({ to: '/login' });
    }
  });

  const handleRegister = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Server-side check already in beforeLoad, but verify again
    const hasUsers = await checkHasUsers();
    if (hasUsers) {
      setError('Setup already completed');
      setLoading(false);
      return;
    }

    const { error: signUpError } = await authClient.signUp.email({
      email: email(),
      password: password(),
      name: name(),
    });

    if (signUpError) {
      setError(signUpError.message || 'Registration failed');
      setLoading(false);
      return;
    }

    router.navigate({ to: '/admin' });
  };

  return (
    <div style={{ margin: '100px auto', maxWidth: '400px', padding: '24px' }}>
      <h1
        style={{ 'font-size': '24px', 'font-weight': 'bold', 'margin-bottom': '24px' }}
      >
        Set Up RSS Feed Manager
      </h1>
      <p style={{ 'margin-bottom': '24px', color: '#6b7280' }}>
        Create the first admin account. Only one registration is allowed.
      </p>

      <form onSubmit={handleRegister}>
        <div style={{ 'margin-bottom': '16px' }}>
          <label
            for="name"
            style={{ display: 'block', 'font-weight': '500', 'margin-bottom': '4px' }}
          >
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name()}
            onInput={(e) => setName(e.currentTarget.value)}
            style={{
              border: '1px solid #d1d5db',
              'border-radius': '6px',
              'box-sizing': 'border-box',
              'font-size': '16px',
              padding: '8px 12px',
              width: '100%',
            }}
            required
          />
        </div>

        <div style={{ 'margin-bottom': '16px' }}>
          <label
            for="email"
            style={{ display: 'block', 'font-weight': '500', 'margin-bottom': '4px' }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email()}
            onInput={(e) => setEmail(e.currentTarget.value)}
            style={{
              border: '1px solid #d1d5db',
              'border-radius': '6px',
              'box-sizing': 'border-box',
              'font-size': '16px',
              padding: '8px 12px',
              width: '100%',
            }}
            required
          />
        </div>

        <div style={{ 'margin-bottom': '24px' }}>
          <label
            for="password"
            style={{ display: 'block', 'font-weight': '500', 'margin-bottom': '4px' }}
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password()}
            onInput={(e) => setPassword(e.currentTarget.value)}
            style={{
              border: '1px solid #d1d5db',
              'border-radius': '6px',
              'box-sizing': 'border-box',
              'font-size': '16px',
              padding: '8px 12px',
              width: '100%',
            }}
            required
          />
        </div>

        {error() && (
          <div
            style={{
              background: '#fef2f2',
              'border-radius': '6px',
              color: '#dc2626',
              'font-size': '14px',
              'margin-bottom': '16px',
              padding: '8px 12px',
            }}
          >
            {error()}
          </div>
        )}

        <button
          type="submit"
          disabled={loading()}
          style={{
            background: '#2563eb',
            border: 'none',
            'border-radius': '6px',
            color: 'white',
            cursor: loading() ? 'not-allowed' : 'pointer',
            'font-size': '16px',
            'font-weight': '500',
            opacity: loading() ? 0.7 : 1,
            padding: '10px 16px',
            width: '100%',
          }}
        >
          {loading() ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
    </div>
  );
};
