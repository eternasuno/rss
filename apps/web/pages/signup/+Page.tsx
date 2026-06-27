import { createSignal } from 'solid-js';

function Field({
  id,
  label,
  type,
  value,
  onInput,
  required,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onInput: (e: Event & { currentTarget: HTMLInputElement }) => void;
  required?: boolean;
}) {
  return (
    <div class="form-control">
      <label class="label" for={id}>
        <span class="label-text">{label}</span>
      </label>
      <input
        id={id}
        name={id}
        type={type}
        class="input input-bordered"
        value={value}
        onInput={onInput}
        required={required}
      />
    </div>
  );
}

function ErrorAlert({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div class="alert alert-error mt-4">
      <span>{message}</span>
    </div>
  );
}

function SubmitButton({
  loading,
  label,
  loadingLabel,
}: {
  loading: boolean;
  label: string;
  loadingLabel: string;
}) {
  return (
    <div class="card-actions mt-4">
      <button type="submit" class="btn btn-primary w-full" disabled={loading}>
        {loading ? loadingLabel : label}
      </button>
    </div>
  );
}

async function signupRequest({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  const res = await fetch('/api/auth/sign-up/email', {
    body: JSON.stringify({ email, name, password }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });
  if (!res.ok) {
    const data = await res.json();
    return { error: data.message || 'Registration failed', ok: false };
  }
  return { ok: true };
}

function makeHandler({
  name,
  email,
  password,
  setError,
  setLoading,
}: {
  name: () => string;
  email: () => string;
  password: () => string;
  setError: (v: string) => void;
  setLoading: (v: boolean) => void;
}) {
  return async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await signupRequest({ email: email(), name: name(), password: password() });
    if (!result.ok) {
      setError(result.error || 'Registration failed');
      setLoading(false);
      return;
    }
    window.location.href = '/';
  };
}

function SignupFormContent({
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  error,
  loading,
  onSubmit,
}: {
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  error: string;
  loading: boolean;
  onSubmit: (e: Event) => void;
}) {
  return (
    <div class="flex min-h-[60vh] items-center justify-center">
      <div class="card bg-base-100 w-full max-w-sm shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Create Account</h2>
          <form onSubmit={onSubmit}>
            <Field
              id="name"
              label="Name"
              type="text"
              value={name}
              onInput={(e) => setName(e.currentTarget.value)}
              required
            />
            <Field
              id="email"
              label="Email"
              type="email"
              value={email}
              onInput={(e) => setEmail(e.currentTarget.value)}
              required
            />
            <Field
              id="password"
              label="Password"
              type="password"
              value={password}
              onInput={(e) => setPassword(e.currentTarget.value)}
              required
            />
            <ErrorAlert message={error} />
            <SubmitButton loading={loading} label="Create Account" loadingLabel="Creating..." />
          </form>
          <div class="mt-4 text-center">
            <a href="/login" class="link">
              Already have an account? Sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  const [name, setName] = createSignal('');
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [error, setError] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  const handleSubmit = makeHandler({ email, name, password, setError, setLoading });
  return (
    <SignupFormContent
      name={name()}
      setName={setName}
      email={email()}
      setEmail={setEmail}
      password={password()}
      setPassword={setPassword}
      error={error()}
      loading={loading()}
      onSubmit={handleSubmit}
    />
  );
}
