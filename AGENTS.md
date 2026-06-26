# RSS Feed Manager

A self-hosted RSS feed management platform. Create feeds, add items via API, and serve RSS/Podcast XML feeds.

## Project Goal

Build an automated RSS pipeline:
1. Provide API to generate RSS/podcast XML consumable by RSS readers and podcast players
2. Future: auto-extract full text, AI processing on item ingestion
3. Ultimate goal: end-to-end automated RSS pipeline

## Design Philosophy

### Flexible Schema — RSS Standard Minimum

Do not bake format-specific fields into the database schema. Follow RSS 2.0 minimum requirements:
- `<channel>` requires: `title`, `link`, `description`
- `<item>` requires: `title` or `description`

All other fields (RSS optional, iTunes namespace, Podcast 2.0, Media RSS, Atom extensions, etc.) go into an `extraData: Record<string, JSONValue>` JSON column. Users decide what fields to include via the API.

### feedsmith Capabilities

feedsmith v2.9.4 natively supports structured nested objects:
- **Standard RSS 2.0**: `enclosures[]`, `pubDate`, `guid`, `categories[]`, `source`, etc.
- **iTunes namespace**: `itunes.author`, `itunes.duration`, `itunes.episode`, `itunes.season`, `itunes.episodeType`, `itunes.image`, `itunes.explicit`, `itunes.categories`, `itunes.owner`, `itunes.type`, `itunes.title`
- **Podcast 2.0**: `podcast.transcripts[]`, `podcast.chapters`, `podcast.persons[]`, `podcast.funding[]`, `podcast.locked`, `podcast.medium`, `podcast.alternateEnclosures[]`, etc.
- **Media RSS**: `media.contents[]`, `media.thumbnails[]`

All fields are passed via nested objects in `extraData`, fed through `...feed.extraData` / `...item.extraData` spread into feedsmith's `generateRssFeed` (in lenient mode).

## Clean Architecture (Effect-TS)

### Architecture Layers

```
gateway/  ──depends on──▶ usecase/  ──depends on──▶ port/  ──depends on──▶ entity/
    │                         ▲
    │                         │ implements
    └──depends on──▶ adapter/ ─┘
                         │
                         └──depends on──▶ infrastructure/
```

Simplified architecture (project is small, single implementations):
- `core/` = Entity + Port + Usecase (depends only on `effect`)
- `adapter/` = All Adapter + Infrastructure implementations

### Entity Layer (`packages/core/src/entity/`)

Pure data models using Effect-TS Schema. Zero framework dependencies.

| Entity | Fields | Notes |
|--------|--------|-------|
| **Feed** | id(FeedId), userId(UserId), title(NonEmptyTrimmedString), description(NonEmptyTrimmedString), link(Schema.URL), extraData(ExtraData), createdAt(DateTime.Utc), updatedAt(DateTime.Utc) | Branded FeedId. link is RSS 2.0 required channel field |
| **Item** | id(ItemId), feedId(FeedId), title(NonEmptyTrimmedString), extraData(ExtraData), createdAt(DateTime.Utc) | Branded ItemId. title is RSS 2.0 minimum for items |

### Target Architecture (WIP)

```
packages/core/src/
├── entity/            # Pure data models (Effect Schema) — DONE
│   ├── value-object.ts  # JSONValue, ExtraData, UserId brand
│   ├── feed.ts
│   └── item.ts
├── port/              # Interface contracts (Effect Tags) — DONE
│   ├── app-error.ts       # Unified AppError (Data.TaggedError with ErrorCode literal)
│   ├── crypto.ts          # UUID generation
│   ├── feed-generator.ts  # RSS XML generation via feedsmith
│   ├── feed-repository.ts
│   └── item-repository.ts
└── usecase/           # Business logic (Effect pipelines) — DONE
    ├── add-item.ts
    ├── create-feed.ts
    ├── generate-xml.ts     # Composes getFeed + FeedGenerator.generateFeedXml
    └── get-feed.ts
```

### Adapter Layer (`packages/adapter/src/`) — DONE

| Adapter | Implements | Technology |
|---------|-----------|------------|
| UUID Crypto | Crypto (core/port) | node:crypto |
| FeedsmithGenerator | FeedGenerator (core/port) | feedsmith (lenient mode) |
| FeedRepository | FeedRepository (core/port) | @effect/sql-drizzle + @effect/sql-sqlite-node |
| ItemRepository | ItemRepository (core/port) | @effect/sql-drizzle + @effect/sql-sqlite-node |

### Database Schema (`packages/infrastructure-sqlite/src/schema.ts`)

All tables defined in one file — both app and better-auth tables:

| Table | Purpose |
|-------|---------|
| `feeds` | RSS feed definitions |
| `items` | Feed items |
| `user`, `session`, `account`, `verification` | BetterAuth auth |
| `api_key` | BetterAuth API key plugin (v1.5+: uses `referenceId`, `configId`) |

Run `pnpm -w run db:push` to create/update all tables in `apps/web/data/rss.db`.

### Gateway Layer (`apps/web/src/routes/`) — DONE

TanStack Start routes and server functions that only do HTTP orchestration:
- Call usecases via `AppRuntime.runPromise()` (Effect ManagedRuntime)
- Wire adapters via Effect's runtime
- Auth via better-auth

### Auth Architecture

- **Server**: `apps/web/src/lib/auth.ts` — betterAuth() instance with Drizzle adapter + API key plugin + TanStack Start cookies
- **Client**: `apps/web/src/lib/auth-client.ts` — createAuthClient() for browser-side auth calls
- **Auth API**: `apps/web/src/routes/api/auth.$.tsx` — TanStack Start route catching `/api/auth/*` with server handlers
- **Auth utilities**: `apps/web/src/lib/auth-utils.ts` — server functions (getSession, checkHasUsers, API key CRUD) use `await import()` for server-only deps to prevent client bundle leaks
- **API key plugin**: Uses `@better-auth/api-key` with schema key `apikey` (lowercase) and `referenceId` field (v1.5+)

## Future Pipeline

```
Source URL → Cron poller → Content extractor → AI processor → structured item → write XML
```

- **Source table**: URL sources to poll periodically
- **Background worker**: Cron job to fetch new content
- **Content extraction**: Readability/article extraction
- **AI processing**: Summarization, tagging, categorization
- **Media processing**: Podcast audio download/transcode

## Ports

| Service | Port |
|---------|------|
| Web app (dev) | 5100 |

## Environment Variables

```
DATABASE_URL=./data/rss.db
BETTER_AUTH_SECRET=change-me-to-a-32-char-random-string
BETTER_AUTH_URL=http://localhost:5100
```

## Commands

| Command | Scope | Description |
|---------|-------|-------------|
| `pnpm build` | root | Build all packages |
| `pnpm check` | root | Type-check + lint all packages |
| `pnpm test` | root | Run all tests |
| `pnpm run test` | packages/core | Run core tests |
| `pnpm run test:watch` | packages/core | Watch mode |
| `pnpm run db:generate` | packages/infrastructure-sqlite | Generate Drizzle migrations |
| `pnpm run db:push` | root (`pnpm -w`) | Create/update SQLite tables in `apps/web/data/rss.db` |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Architecture | Clean Architecture + Effect-TS |
| Schema & Validation | Effect Schema (imported from `effect`) |
| Full-stack framework | TanStack Start + SolidJS |
| Build tool | Vite 7 |
| Database | SQLite (Drizzle ORM + @effect/sql-sqlite-node) |
| RSS generation | feedsmith |
| Monorepo | pnpm 11 + Turborepo |
| Lint/Format | Biome |
| Auth | better-auth (TanStack Start) |
