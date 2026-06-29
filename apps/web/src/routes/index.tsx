import { Title } from '@solidjs/meta';
import { signOut, useSession } from '../lib/auth-client';

export default function Home() {
  const session = useSession();

  return (
    <main>
      <Title>RSS Reader</Title>
      <h1>RSS Reader</h1>
      {session().data ? (
        <>
          <p>Welcome, {session().data?.user?.name ?? 'User'}!</p>
          <nav>
            <a href="/dashboard">Dashboard</a>
          </nav>
          <button onClick={() => signOut()} type="button">
            Sign Out
          </button>
        </>
      ) : (
        <nav>
          <a href="/login">Login</a> <a href="/register">Register</a>
        </nav>
      )}
    </main>
  );
}
