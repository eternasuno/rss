import { createFileRoute, redirect, useRouter } from '@tanstack/solid-router';
import { createSignal } from 'solid-js';
import { loginFn } from '../server/auth';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [error, setError] = createSignal('');
  const [loading, setLoading] = createSignal(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await loginFn({ data: { email: email(), password: password() } });

    if (!result.success) {
      setError(result.error || 'Login failed');
      setLoading(false);
      return;
    }

    router.navigate({ to: '/admin' });
  };

  const handleRegister = async () => {
    if (!email() || !password()) return;
    setLoading(true);
    setError('');

    const result = await loginFn({ data: { email: email(), password: password() } });

    if (!result.success) {
      // If login fails, user might need to register
      const { registerFn } = await import('../server/auth');
      const regResult = await registerFn({ data: { email: email(), password: password() } });

      if (!regResult.success) {
        setError(regResult.error || 'Registration failed');
        setLoading(false);
        return;
      }
    }

    router.navigate({ to: '/admin' });
  };

  return (
    <div style={{ margin: '100px auto', maxWidth: '400px', padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
        RSS Feed Manager
      </h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '4px' }} for="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email()}
            onInput={(e) => setEmail(e.currentTarget.value)}
            style={{
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              boxSizing: 'border-box',
              fontSize: '16px',
              padding: '8px 12px',
              width: '100%',
            }}
            required
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label
            style={{ display: 'block', fontWeight: '500', marginBottom: '4px' }}
            for="password"
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
              borderRadius: '6px',
              boxSizing: 'border-box',
              fontSize: '16px',
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
              borderRadius: '6px',
              color: '#dc2626',
              fontSize: '14px',
              marginBottom: '16px',
              padding: '8px 12px',
            }}
          >
            {error()}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="submit"
            disabled={loading()}
            style={{
              background: '#2563eb',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: loading() ? 'not-allowed' : 'pointer',
              flex: 1,
              fontSize: '16px',
              fontWeight: '500',
              opacity: loading() ? 0.7 : 1,
              padding: '10px 16px',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            disabled={loading()}
            onClick={handleRegister}
            style={{
              background: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              color: '#374151',
              cursor: loading() ? 'not-allowed' : 'pointer',
              flex: 1,
              fontSize: '16px',
              fontWeight: '500',
              padding: '10px 16px',
            }}
          >
            Register
          </button>
        </div>
      </form>
    </div>
  );
};
