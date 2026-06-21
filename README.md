# RSS Feed Manager

A self-hosted RSS feed management platform. Create feeds via a web UI, add items via API, and serve RSS XML feeds.

## Tech Stack

- **Full-stack**: TanStack Start + SolidJS (Vite + Node.js)
- **Database**: SQLite (Drizzle ORM + better-sqlite3)
- **RSS**: feedsmith (generateRssFeed)
- **Monorepo**: pnpm workspace + Turborepo
- **Lint/Format**: Biome

## Project Structure

```
rss/                         ← Monorepo root
├── apps/
│   └── web/                 ← TanStack Start + Solid app
│       ├── src/
│       │   ├── routes/      ← Page routes + server routes
│       │   ├── server/      ← Server functions (auth, feeds)
│       │   ├── db/          ← Drizzle schema + connection
│       │   ├── lib/         ← Auth utilities + RSS generation
│       │   ├── utils/       ← Session helpers
│       │   └── router.tsx   ← Router config
│       ├── drizzle/         ← Generated migrations
│       └── data/            ← SQLite database + RSS XML files
├── packages/
│   └── shared/              ← Shared TypeScript types
└── turbo.json               ← Turborepo config
```

## Getting Started

```bash
# Activate dev environment
direnv allow

# Install dependencies
pnpm install

# Run database migrations
cd apps/web && pnpm run db:migrate

# Create .env file
cp .env.example .env

# Start dev server
pnpm dev
```

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all dev servers (Turborepo) |
| `pnpm lint` | Lint all packages (Biome) |
| `pnpm typecheck` | Type-check all packages |
| `cd apps/web && pnpm run db:generate` | Generate DB migrations |
| `cd apps/web && pnpm run db:migrate` | Run DB migrations |
| `cd apps/web && pnpm run db:push` | Push schema directly (dev only) |
| `cd apps/web && pnpm run db:studio` | Open Drizzle Studio |

## Ports

| Service | Port |
|---------|------|
| Web app (dev) | 5100 |

## Database Schema

- **users** — Email + password authentication
- **api_keys** — API keys for programmatic access
- **feeds** — RSS feed definitions (title, description, link, extensible JSON data)
- **items** — Feed items (title required, all other fields in extensible JSON data)

## API

### Add Item
```http
POST /api/:feedId/items
X-API-Key: <your-api-key>
Content-Type: application/json

{
  "title": "Required",
  "data": {
    "description": "Optional",
    "link": "https://...",
    "content": "...",
    "author": "...",
    "pubDate": "2026-01-01T00:00:00Z"
  }
}
```

### RSS Feed
```
GET /feed/:feedId
```
Returns `application/rss+xml`.
