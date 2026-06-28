import Link from 'next/link';
import { SignUpForm } from './sign-up-form';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Create account</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Start managing your RSS feeds
          </p>
        </div>

        <SignUpForm />

        <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Already have an account?{' '}
          <Link
            href="/sign-in"
            className="font-medium text-zinc-900 underline underline-offset-4 hover:text-zinc-600 dark:text-zinc-100"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
