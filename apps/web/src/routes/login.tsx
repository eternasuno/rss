import { createFileRoute, redirect, useRouter } from '@tanstack/solid-router';
import { Show, createSignal, Suspense } from 'solid-js';
import { authClient } from '~/lib/auth-client';

export const Route = createFileRoute('/login')({
  component: Login,
});

function Login() {
  const session = authClient.useSession();
  const router = useRouter();

  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [error, setError] = createSignal('');
  const [loading, setLoading] = createSignal(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await authClient.signIn.email({
      email: email(),
      password: password(),
    });

    setLoading(false);

    if (result.error) {
      setError(result.error.message || 'Sign in failed');

      return;
    }

    router.invalidate();
    throw redirect({ to: '/' });
  };

  return (
    <div style={{ 'max-width': '400px', margin: '4rem auto', padding: '0 1rem' }}>
      <Suspense fallback={<p>Loading...</p>}>
        <Show when={!session()}>
          <h1>Sign In</h1>
          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem' }}
          >
            <div>
              <label for="email" style={{ display: 'block', 'margin-bottom': '0.25rem', 'font-weight': 600 }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email()}
                onInput={(e) => setEmail(e.currentTarget.value)}
                required
                style={{
                  border: '1px solid var(--color-border)',
                  padding: '0.5rem',
                  'border-radius': 'var(--radius)',
                  width: '100%',
                }}
              />
            </div>
            <div>
              <label for="password" style={{ display: 'block', 'margin-bottom': '0.25rem', 'font-weight': 600 }}>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password()}
                onInput={(e) => setPassword(e.currentTarget.value)}
                required
                style={{
                  border: '1px solid var(--color-border)',
                  padding: '0.5rem',
                  'border-radius': 'var(--radius)',
                  width: '100%',
                }}
              />
            </div>
            <Show when={error()}>
              <p style={{ color: 'var(--color-error)', 'font-size': '0.875rem', margin: 0 }}>
                {error()}
              </p>
            </Show>
            <button
              type="submit"
              disabled={loading()}
              style={{
                background: 'var(--color-primary)',
                color: '#fff',
                border: 'none',
                padding: '0.6rem 1rem',
                'border-radius': 'var(--radius)',
                cursor: loading() ? 'not-allowed' : 'pointer',
                opacity: loading() ? 0.7 : 1,
              }}
            >
              {loading() ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p style={{ 'margin-top': '1rem', 'font-size': '0.875rem' }}>
            Don&apos;t have an account? <a href="/register">Register</a>
          </p>
        </Show>
      </Suspense>
    </div>
  );
}
