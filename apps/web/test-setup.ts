import { auth } from '@/lib/auth';

const userId = process.argv[2];
if (!userId) {
  console.log('Usage: tsx test-setup.ts <userId>');
  process.exit(1);
}

async function main() {
  const result = await auth.api.createApiKey({
    body: { name: 'CI Test Key', permissions: { items: ['create'] }, userId },
  });
  console.log(JSON.stringify({ id: result.id, key: result.key }));
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
