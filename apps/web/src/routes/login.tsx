import { Title } from '@solidjs/meta';
import { createSignal } from 'solid-js';
import { signIn } from '../lib/auth-client';

function Input(props: {
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type={props.type}
      placeholder={props.placeholder}
      value={props.value}
      onInput={(e) => props.onChange((e.currentTarget as HTMLInputElement).value)}
      required
    />
  );
}

async function handleLogin(opts: {
  e: Event;
  email: string;
  password: string;
  setError: (v: string) => void;
  setLoading: (v: boolean) => void;
}) {
  opts.e.preventDefault();
  opts.setLoading(true);
  opts.setError('');
  const { error: err } = await signIn.email({
    email: opts.email,
    password: opts.password,
  });
  if (err) {
    opts.setError(err.message ?? 'Login failed');
    opts.setLoading(false);
    return;
  }

  window.location.href = '/dashboard';
}

export default function Login() {
  const [em, setEm] = createSignal('');
  const [pw, setPw] = createSignal('');
  const [er, setEr] = createSignal('');
  const [ld, setLd] = createSignal(false);
  const h = (e: Event) =>
    handleLogin({
      e,
      email: em(),
      password: pw(),
      setError: setEr,
      setLoading: setLd,
    });
  return (
    <>
      <Title>Login</Title>
      <h1>Login</h1>
      <form onSubmit={h}>
        <Input type="email" placeholder="Email" value={em()} onChange={setEm} />
        <Input type="password" placeholder="Password" value={pw()} onChange={setPw} />
        <button type="submit" disabled={ld()}>
          {ld() ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      {er() && <p role="alert">{er()}</p>}
      <p>
        Don't have an account? <a href="/register">Register</a>
      </p>
    </>
  );
}
