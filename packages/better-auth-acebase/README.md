# better-auth-acebase

A [Better Auth](https://better-auth.com) database adapter for [AceBase](https://github.com/appy-one/acebase) — an embedded, local-first, JSON-document database.

## Installation

```sh
pnpm add better-auth-acebase acebase better-auth
```

## Usage

```ts
import { betterAuth } from 'better-auth';
import { AceBase } from 'acebase';
import { acebaseAdapter } from 'better-auth-acebase';

const db = new AceBase('myapp', { storage: { path: './.data' } });

const auth = betterAuth({
  database: acebaseAdapter({ db }),
  // ... your config
});
```

You own the `AceBase` instance, so you can use it directly for other database operations outside of Better Auth (e.g., storing app-specific data).

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `db` | `AceBase` | required | An initialized AceBase instance |
| `usePlural` | `boolean` | `false` | Whether to pluralize table names (e.g. `users` instead of `user`) |
| `debugLogs` | `boolean` | `false` | Enable debug logging from the adapter factory |

## How it works

The adapter stores each Better Auth table (`user`, `session`, `account`, `verification`, `rateLimit`) as a top-level path in AceBase. Records are stored as child nodes keyed by their ID:

```
users/{userId}                 → User object
sessions/{sessionToken}        → Session object
accounts/{accountId}           → Account linking info
verification/{tokenId}         → Verification token
rate-limit/{key}              → Rate limit entry
```

Dates are stored as ISO 8601 strings (`supportsDates: false`) — the adapter factory handles Date ↔ ISO string conversion on input and output.

Indexes are created automatically on initialization for common query patterns (email lookups, session tokens, user foreign keys, etc.).

## Limitations

- **OR queries**: OR connectors in where clauses are not supported. Better Auth's core flows only use AND, so this is not a practical concern.
- **Joins**: AceBase does not support relational joins. The adapter factory provides a fallback join implementation for the few places Better Auth uses them (e.g. session → user lookups).
- **Atomicity**: `consumeOne` and `incrementOne` rely on the factory's sequential fallback, which is not atomic. This is acceptable for single-process deployments with small user bases.
- **Query count performance**: AceBase's `count()` loads matching data into memory (O(n)). For the typical session/verification table sizes in Better Auth, this is acceptable.

## Known issues with `@better-auth/test-utils`

The standardized adapter test suite from `@better-auth/test-utils/adapter` is **not currently usable** with this adapter due to the test framework's internal wrapper adapter.

### Root cause

The test framework wraps every adapter in a secondary `createAdapterFactory` call with `disableTransformInput: true`, `disableTransformOutput: true`, and `disableTransformJoin: true` hardcoded ([source](https://github.com/better-auth/better-auth/blob/main/packages/test-utils/src/adapter/create-test-suite.ts)). This bypasses the factory's data transform pipeline, which causes:

1. **Date format mismatch**: The factory's Date ↔ ISO string conversion (required by `supportsDates: false`) is disabled on the wrapper, so raw `Date` objects leak through instead of ISO strings, causing deep-equality assertion failures in the test suite.

2. **Join fallback bypassed**: Factory join fallback is disabled by `disableTransformJoin: true`, so join-related tests fail — even though the adapter's own join-free operations work fine.

### Workaround

The adapter has a manual test suite at `src/adapter.test.ts` covering all core CRUD operations (12 tests). Run it with:

```sh
pnpm test
```
