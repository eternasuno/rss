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
| **User** | id(UserId), email(NonEmptyTrimmedString) | Branded UserId. Emails are trimmed at schema level. No createdAt, no passwordHash — auth is a Port concern |
| **ApiKey** | id(ApiKeyId), key(NonEmptyTrimmedString), userId(UserId), expiresAt(Date), lastUsedAt(Date), createdAt(Date) | Branded ApiKeyId. key stored raw, user can re-copy |
| **Feed** | id(FeedId), userId(UserId), title(NonEmptyTrimmedString), description(NonEmptyTrimmedString), link(Schema.URL), extraData(ExtraData), createdAt(Date), updatedAt(Date) | Branded FeedId. link is RSS 2.0 required channel field |
| **Item** | id(ItemId), feedId(FeedId), title(NonEmptyTrimmedString), extraData(ExtraData), createdAt(Date) | Branded ItemId. title is RSS 2.0 minimum for items |

### Target Architecture (WIP)

```
packages/core/src/
├── entity/            # Pure data models (Effect Schema) — DONE
│   ├── json.ts        # JSONValue type + ExtraData schema
│   ├── user.ts
│   ├── api-key.ts
│   ├── feed.ts
│   └── item.ts
├── port/              # Interface contracts (Effect Tags) — DONE
│   ├── app-error.ts       # Unified AppError (Data.TaggedError with ErrorCode literal)
│   ├── user-repository.ts
│   ├── api-key-repository.ts
│   ├── feed-repository.ts
│   ├── item-repository.ts
│   ├── hash-service.ts    # Password hashing (SHA-256), single hash method
│   └── feed-generator.ts  # RSS XML generation via feedsmith
└── usecase/           # Business logic (Effect pipelines) — TODO
    ├── create-feed.ts
    ├── add-item.ts
    ├── get-feed.ts
    ├── get-feed-detail.ts
    ├── login.ts
    ├── register.ts
    └── regenerate-xml.ts
```

### Adapter Layer (`packages/infra-*` or `apps/web/src/adapter/`) — TODO

| Adapter | Implements | Technology |
|---------|-----------|------------|
| SqliteFeedRepository | FeedRepository | Drizzle + better-sqlite3 |
| SqliteItemRepository | ItemRepository | Drizzle + better-sqlite3 |
| SqliteUserRepository | UserRepository | Drizzle + better-sqlite3 |
| SqliteApiKeyRepository | ApiKeyRepository | Drizzle + better-sqlite3 |
| NodeCryptoHashService | HashService | Node.js crypto (SHA-256) |
| FeedsmithGenerator | FeedGenerator | feedsmith (lenient mode) |

### Gateway Layer (`apps/web/src/gateway/`) — TODO

TanStack Start routes and server functions that only do HTTP orchestration:
- Call usecases (no business logic)
- Wire adapters via Effect's Runtime
- Format HTTP responses

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
SESSION_SECRET=change-me-to-a-32-char-random-string
```

## Commands

| Command | Scope | Description |
|---------|-------|-------------|
| `pnpm dev` | root | Start Turborepo dev |
| `pnpm lint` | root | Lint all packages |
| `pnpm typecheck` | root | Type-check all packages |
| `pnpm format` | root | Format with Biome |
| `pnpm run typecheck` | packages/core | Type-check core package |
| `pnpm run db:generate` | apps/web | Generate Drizzle migrations |
| `pnpm run db:migrate` | apps/web | Apply migrations |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Architecture | Clean Architecture + Effect-TS |
| Schema & Validation | Effect Schema (imported from `effect`) |
| Full-stack framework | TanStack Start + SolidJS |
| Build tool | Vite 7 |
| Database | SQLite (Drizzle ORM + better-sqlite3) |
| RSS generation | feedsmith |
| Monorepo | pnpm workspace + Turborepo |
| Lint/Format | Biome |
| Auth | Session cookies + SHA256 (server functions) |
