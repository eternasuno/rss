# RSS Feed Manager

Self-hosted RSS feed management platform. Create feeds, add items via API, serve RSS/Podcast XML.

## Project Status

- `packages/core/`, `packages/adapter/`, `packages/infrastructure-sqlite/` — DONE
- `apps/` — EMPTY (no web/gateway layer yet; routes, auth, HTTP server not implemented)

## Quick Start

```bash
pnpm install && pnpm prepare   # install + patch TypeScript LSP for Effect
pnpm --filter @rss/infrastructure-sqlite run db:push
pnpm check                     # type-check + lint all packages
pnpm test                      # run all tests
```

## Architecture

```
core/   = Entity + Port + Usecase (depends only on effect)
adapter/ = All Adapter + Infrastructure (depends on core + infra-sqlite)
infrastructure-sqlite/  = SQLite schema + DB layer
```

### Entity (packages/core/src/entity/)
Effect Schema models. Branded IDs (`FeedId`, `ItemId`, `UserId`). RSS-standard fields are typed; all optional/namespace fields go in `extraData: Record<string, JSONValue>`.

### Port (packages/core/src/port/)
Effect Context Tags (interfaces). Each is a `Context.Tag` with an `interface`:

```ts
export class FeedRepository extends Context.Tag('FeedRepository')<FeedRepository, IFeedRepository>() {}
```

### Usecase (packages/core/src/usecase/)
Effect pipelines using `Effect.gen`. Dependencies resolved via `yield*`. No framework deps.

### Adapter (packages/adapter/src/)
Layers implementing ports. Built with `Layer.succeed` or `Layer.effect`.

### Infra-sqlite (packages/infrastructure-sqlite/src/)
- `db.ts` — `DB` class extending `Effect.Service`, uses `@effect/sql-sqlite-node` + `@effect/sql-drizzle`
- `schema.ts` — Drizzle SQLite tables for feeds, items, and better-auth (user, session, account, verification, api_key)
- Default DB: `data/db.sqlite` (overridable via `DATABASE_URL` env var)

## Testing Patterns

Uses `@effect/vitest` (`it.effect`):

```ts
it.effect('description', () =>
  Effect.gen(function* () {
    const result = yield* someUsecase(input);
    assert.strictEqual(result.property, expected);
  }).pipe(Effect.provide(Layer.mergeAll(MockA, MockB)))
);
```

- Core tests use hand-rolled mock Layers (`packages/core/test/mock/`)
- Adapter tests use in-memory SQLite (`:memory:`) with `createTables` before each test group
- `ConfigProvider.fromJson({ DATABASE_URL: ':memory:' })` for DB tests

## Commands

| Command | Scope | Description |
|---------|-------|-------------|
| `pnpm build` | root | Build all packages (turbo) |
| `pnpm check` | root | `tsc --noEmit && biome check --fix` per package |
| `pnpm test` | root | Run all package tests (turbo) |
| `pnpm prepare` | root | Run `effect-language-service patch` (needed for TS LSP) |
| `pnpm --filter @rss/$PACKAGE run test` | root | Test one package (core, adapter, infrastructure-sqlite) |
| `pnpm --filter @rss/infrastructure-sqlite run db:push` | root | Push schema to SQLite |
| `pnpm --filter @rss/infrastructure-sqlite run db:generate` | root | Generate Drizzle migrations |
| `pnpm --filter @rss/infrastructure-sqlite run db:studio` | root | Drizzle Studio |

## Key Conventions

- **No comments in code** unless absolutely necessary
- **Single-parameter functions** (Biome enforces max 1 param; use objects for multiple)
- **ESM only** (`"type": "module"` everywhere)
- **Imports from effect** — `Schema`, `DateTime`, `Effect`, `Layer`, `Context`, `Option`, `pipe`
- **Branded types** via `Schema.String.pipe(Schema.brand('X'))` — use `.make()` to construct
- **`extraData` spread pattern**: `...feed.data` / `...item.data` + destructure known fields
- **pmpm catalog** for shared deps in `pnpm-workspace.yaml`
- **Biome over Prettier** — single quotes, trailing commas (es5), 2-space indent, 98 line width

## Environment Variables

```
DATABASE_URL=./data/db.sqlite
BETTER_AUTH_SECRET=change-me-to-a-32-char-random-string
BETTER_AUTH_URL=http://localhost:5100
```

## Dev Environment

- `devenv` (Nix) + `direnv` — auto-activates on `cd`
- `.devcontainer.json` for containerized dev
- No CI workflows configured yet
