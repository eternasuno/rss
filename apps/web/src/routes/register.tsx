import { Title } from '@solidjs/meta';
import { createSignal } from 'solid-js';
import { signUp } from '../lib/auth-client';

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

async function handleRegister(opts: {
  e: Event;
  name: string;
  email: string;
  password: string;
  setError: (v: string) => void;
  setLoading: (v: boolean) => void;
}) {
  opts.e.preventDefault();
  opts.setLoading(true);
  opts.setError('');
  const { error: err } = await signUp.email({
    email: opts.email,
    name: opts.name,
    password: opts.password,
  });
  if (err) {
    opts.setError(err.message ?? 'Registration failed');
    opts.setLoading(false);
    return;
  }

  window.location.href = '/dashboard';
}

export default function Register() {
  const [nm, setNm] = createSignal('');
  const [em, setEm] = createSignal('');
  const [pw, setPw] = createSignal('');
  const [er, setEr] = createSignal('');
  const [ld, setLd] = createSignal(false);
  const h = (e: Event) =>
    handleRegister({
      e,
      email: em(),
      name: nm(),
      password: pw(),
      setError: setEr,
      setLoading: setLd,
    });
  return (
    <>
      <Title>Register</Title>
      <h1>Register</h1>
      <form onSubmit={h}>
        <Input type="text" placeholder="Name" value={nm()} onChange={setNm} />
        <Input type="email" placeholder="Email" value={em()} onChange={setEm} />
        <Input type="password" placeholder="Password" value={pw()} onChange={setPw} />
        <button type="submit" disabled={ld()}>
          {ld() ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>
      {er() && <p role="alert">{er()}</p>}
      <p>
        Already have an account? <a href="/login">Login</a>
      </p>
    </>
  );
}
