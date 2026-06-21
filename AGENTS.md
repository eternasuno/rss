# RSS Feed Manager

A self-hosted RSS feed management platform built with TanStack Start, SolidJS, and SQLite.

## Project Goal

Provide a web UI to create and manage RSS feeds, an API to programmatically add items, and auto-generated RSS XML feeds served as static files.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Full-stack framework | TanStack Start + SolidJS |
| Build tool | Vite 7 |
| Database | SQLite (Drizzle ORM + better-sqlite3) |
| RSS generation | feedsmith |
| Monorepo | pnpm workspace + Turborepo |
| Lint/Format | Biome |
| Auth | Session cookies + bcrypt (server functions) |

## Commands

| Command | Scope | Description |
|---------|-------|-------------|
| `pnpm dev` | root | Start Turborepo dev |
| `pnpm lint` | root | Lint all packages |
| `pnpm typecheck` | root | Type-check all packages |
| `pnpm format` | root | Format with Biome |
| `pnpm run db:generate` | apps/web | Generate Drizzle migrations |
| `pnpm run db:migrate` | apps/web | Apply migrations |
| `pnpm run db:push` | apps/web | Push schema (dev) |
| `pnpm run db:studio` | apps/web | Drizzle Studio |

## Architecture

```
apps/web/src/
├── routes/           Page & server routes (file-based routing via TanStack Router)
│   ├── __root.tsx    Root layout (HTML document shell)
│   ├── index.tsx     Home → redirect to /admin
│   ├── login.tsx     Login page (email + password)
│   ├── _authed.tsx   Auth guard (beforeLoad → redirect if no session)
│   ├── _authed/admin/ Admin pages (create/list feeds)
│   ├── feed.$id.ts   Server route: GET /feed/:id → RSS XML
│   └── api.$feedId.items.ts  Server route: POST /api/:feedId/items
├── server/           Server functions (createServerFn)
│   ├── auth.ts       login/logout/register/getCurrentUser
│   └── feeds.ts      createFeed/listFeeds/getFeedDetail
├── db/               Database layer
│   ├── schema.ts     Drizzle schema (users, apiKeys, feeds, items)
│   └── index.ts      DB connection + migrator
├── lib/              Pure utilities
│   ├── auth.ts       Password hashing, token generation
│   └── feed-gen.ts   RSS XML generation + file I/O
├── utils/
│   └── session.ts    TanStack Start session helper
└── router.tsx        Router configuration
```

## API Routes

- `POST /api/:feedId/items` — Add item (requires `X-API-Key` header)
- `GET /feed/:id` — RSS XML feed

## Page Routes

- `/login` — Login/Register page
- `/admin` — Feed management (authenticated)
- `/admin/feed/:id` — Feed detail with items

## Environment Variables

```
DATABASE_URL=./data/rss.db
SESSION_SECRET=change-me-to-a-32-char-random-string
```
