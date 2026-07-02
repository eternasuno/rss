import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { normalTestSuite, testAdapter } from '@better-auth/test-utils/adapter';
import { AceBase } from 'acebase';
import { describe } from 'vitest';
import { acebaseAdapter } from '../src/adapter';

const testDir = `/tmp/acebase-test-${Date.now()}`;

if (!existsSync(testDir)) {
  mkdirSync(testDir, { recursive: true });
}

const db = new AceBase('test', { logLevel: 'warn', storage: { path: testDir } });
await db.ready();

const { execute } = await testAdapter({
  adapter: () => acebaseAdapter({ db }),
  onFinish: () => {
    if (existsSync(testDir)) {
      rmSync(testDir, { force: true, recursive: true });
    }
  },
  runMigrations: () => {},
  tests: [normalTestSuite()],
});

describe('AceBase Adapter', () => {
  execute();
});
