import { readFileSync } from 'node:fs';
import { join } from 'node:path';

try {
  const data = readFileSync(join(process.cwd(), '.env'), 'utf-8');

  for (const line of data.split('\n')) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const eq = trimmed.indexOf('=');

    if (eq > 0) {
      const key = trimmed.slice(0, eq);
      const val = trimmed.slice(eq + 1);

      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
} catch {
  /* .env not found */
}
