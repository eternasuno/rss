export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center py-32 px-16">
        <h1 className="text-4xl font-bold tracking-tight">RSS Feed Manager</h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          Self-hosted RSS feed management platform
        </p>
      </main>
    </div>
  );
}
