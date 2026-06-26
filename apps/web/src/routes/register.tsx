import { createFileRoute, redirect, useRouter } from '@tanstack/solid-router';
import { Show, createSignal, createResource, Suspense } from 'solid-js';
import { authClient } from '~/lib/auth-client';
import { checkHasUsers } from '~/lib/auth-utils';

export const Route = createFileRoute('/register')({
  component: Register,
});

function Register() {
  const session = authClient.useSession();
  const router = useRouter();

  const [name, setName] = createSignal('');
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [error, setError] = createSignal('');
  const [loading, setLoading] = createSignal(false);

  const [hasUsers] = createResource(() => checkHasUsers());

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await authClient.signUp.email({
      email: email(),
      name: name(),
      password: password(),
    });

    setLoading(false);

    if (result.error) {
      setError(result.error.message || 'Registration failed');

      return;
    }

    router.invalidate();
    throw redirect({ to: '/' });
  };

  return (
    <div style={{ 'max-width': '400px', margin: '4rem auto', padding: '0 1rem' }}>
      <Suspense fallback={<p>Loading...</p>}>
        <Show when={!session()}>
          <h1>Register</h1>
          <Suspense fallback={<p>Checking registration status...</p>}>
            <Show
              when={hasUsers() !== undefined}
            >
              <Show
                when={!hasUsers()}
                fallback={
                  <div>
                    <p style={{ color: 'var(--color-muted)' }}>
                      Registration is closed. Only one user account is allowed.
                    </p>
                    <p>
                      <a href="/login">Sign in instead</a>
                    </p>
                  </div>
                }
              >
                <form
                  onSubmit={handleSubmit}
                  style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem' }}
                >
                  <div>
                    <label
                      for="name"
                      style={{ display: 'block', 'margin-bottom': '0.25rem', 'font-weight': 600 }}
                    >
                      Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name()}
                      onInput={(e) => setName(e.currentTarget.value)}
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
                    <label
                      for="email"
                      style={{ display: 'block', 'margin-bottom': '0.25rem', 'font-weight': 600 }}
                    >
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
                    <label
                      for="password"
                      style={{ display: 'block', 'margin-bottom': '0.25rem', 'font-weight': 600 }}
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password()}
                      onInput={(e) => setPassword(e.currentTarget.value)}
                      required
                      minLength={8}
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
                    {loading() ? 'Creating account...' : 'Create Account'}
                  </button>
                </form>
              </Show>
            </Show>
          </Suspense>
          <p style={{ 'margin-top': '1rem', 'font-size': '0.875rem' }}>
            Already have an account? <a href="/login">Sign in</a>
          </p>
        </Show>
      </Suspense>
    </div>
  );
}
