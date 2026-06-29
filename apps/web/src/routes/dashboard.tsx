import { Title } from '@solidjs/meta';
import { signOut, useSession } from '../lib/auth-client';

export default function Dashboard() {
  const session = useSession();

  if (!session().data) {
    return (
      <main>
        <Title>Dashboard</Title>
        <h1>Dashboard</h1>
        <p>
          Please <a href="/login">log in</a> to view your dashboard.
        </p>
      </main>
    );
  }

  return (
    <main>
      <Title>Dashboard</Title>
      <h1>Dashboard</h1>
      <p>Welcome, {session().data?.user?.name ?? 'User'}!</p>
      <p>Email: {session().data?.user?.email ?? ''}</p>
      <button onClick={() => signOut()} type="button">
        Sign Out
      </button>
    </main>
  );
}
