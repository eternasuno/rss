# RSS Reader — AGENTS.md

## Quick start

```sh
pnpm install                     # install all workspace deps (apps/api + apps/client)
cp apps/api/.env.example apps/api/.env  # edit BETTER_AUTH_SECRET
pnpm --filter api db:push        # create SQLite tables
pnpm dev                         # turbo dev — starts both api + client
```

- API runs on `http://localhost:3001`
- Client dev server on `http://localhost:5100`, proxies `/api/*` and `/rss/*` to :3001
- Production build: `pnpm build:deploy` (rsbuild from root, outputs to `dist/`)

## Monorepo structure

```
apps/
  api/     Hono + Effect + Drizzle ORM + better-auth backend (entry: src/index.ts)
  client/  SolidJS + Tailwind v4 + DaisyUI v5 SPA (entry: src/index.tsx)
```

Two `pnpm-workspace` packages: `api` and `client`. Use `--filter api` or `--filter client` for targeted commands.

Validation pipeline: `pnpm check` runs **tsc --noEmit first, then Biome check --write** in each package (api's `check` script does both; client's does only tsc).

## API architecture

- **Framework**: [Hono](https://hono.dev/) with `@hono/node-server`
- **Auth**: [better-auth](https://www.better-auth.com/) — session-based for SPA, API-key-based for external POST /items
  - Session middleware applied after public RSS routes, dual-auth middleware only on POST `/api/feeds/:feedId/items`
  - `userId` available via `c.get('userId')`
- **Validation**: [Effect Schema](https://effect.website/docs/schema/) — entity schemas live in `apps/api/src/entity/`
- **Error handling**: `AppError` class (lib/app-error.ts) with static factories (notFound, unauthorized, validation); caught by Hono's `app.onError`
- **DB**: [Drizzle ORM](https://orm.drizzle.team/) rc4 with Turso (SQLite) dialect
  - Schema files in `apps/api/src/db/schema/` (one file per table)
  - Relations in `apps/api/src/db/relations.ts`
  - Run `pnpm --filter api db:push` after schema changes
  - Cache layer: `feed_xml` table stores generated RSS XML; invalidated on feed/item mutations
- **RSS XML generation**: `feedsmith` library
- **Port**: defaults to 3001, override with `API_PORT` env

## Client architecture

- **Framework**: [SolidJS](https://www.solidjs.com/) v1.9 with [@solidjs/router](https://github.com/solidjs/solid-router) v0.15
- **Data fetching**: [@tanstack/solid-query](https://tanstack.com/query/latest) v5
- **UI**: [Tailwind CSS](https://tailwindcss.com/) v4 + [DaisyUI](https://daisyui.com/) v5 components
- **Auth client**: `better-auth/solid` — `createAuthClient()` in `lib/auth-client.ts`
- **Build**: [Rsbuild](https://rsbuild.dev/) with Solid + Tailwind plugins
- **Proxy**: dev server proxies `/api/*` and `/rss/*` to `http://localhost:3001`

## Toolchain quirks

- **Biome is strict**: max 1 function parameter, 20 lines per function, cognitive complexity ≤ 8, 150 lines per file. These are enforced by `biome.json` — fix lint before committing.
- **No `.js` extensions** in local imports (moduleResolution: bundler).
- **No `index.ts` barrel files** — export directory contents via a parent file named after the directory (e.g., `entity.ts` re-exports `entity/`).
- **Build**: Rsbuild (not Vite, not tsc). Both backend and frontend are built with it. Root `rsbuild.config.ts` defines two environments (frontend + backend).
- **TypeScript**: `noEmit: true` — only used for type checking, not compilation.
- **Devenv**: Nix-based dev environment. `.envrc` loads it via direnv. Container build uses `devenv.nix` `containers.prod`.

## Environment variables (api)

| Variable | Default | Required |
|---|---|---|
| `API_PORT` | 3001 | |
| `DATABASE_URL` | `.data/sqlite.db` | |
| `BETTER_AUTH_SECRET` | — | Yes |
| `BETTER_AUTH_URL` | `http://localhost:3001` | |

## Testing

No test files or test framework found yet. If adding tests, prefer Effect's `@effect/vitest` pattern used elsewhere in this project's ecosystem.

## Important constraints

- DB tables created via `pnpm --filter api db:push`, not migrations (drizzle-kit push mode).
- The root `rsbuild.config.ts` is the top-level build config; client has its own `rsbuild.config.ts` that's merged via `mergeRsbuildConfig`.
- `AGENTS.md` must stay concise — content that can be checked by tooling (Biome, typechecker) belongs in config, not here.
