# Database & migrations

LemonTV uses **Drizzle ORM** over **Turso/libSQL** (SQLite). Schema is defined in
`src/lib/server/db/schema.ts` (re-exporting `src/lib/server/db/schemas/**`).

## Use migrations, not `push`

**Do not run `drizzle-kit push` against prod.** On Turso/libSQL, `push`
introspects the live DB and diffs it against the schema — and that introspection
does not round-trip, so it concludes **every** table differs and proposes to
drop-and-rebuild all ~48 tables on every run (even a one-column table, even a
table just created from its own generated DDL). Beyond being wasteful, a rebuild
copies data then drops the original, so a new constraint that conflicts with
existing rows (e.g. a `UNIQUE` index over duplicate data) aborts the rebuild with
the table already dropped → data loss.

Migrations avoid this entirely: `generate` diffs the schema against the previous
**snapshot** (`drizzle/meta`), not the live DB, so each migration contains only
the real, intended change.

## Workflow

```bash
# 1. Edit the schema under src/lib/server/db/schemas/**
# 2. Generate a migration (offline; review the SQL it writes to drizzle/)
bun run db:generate

# 3. Apply
bun run db:dev:migrate     # local dev.db
bun run db:prod:migrate    # prod (also run automatically by `bun run deploy`)
```

`bun run deploy` now dumps a backup then runs `db:prod:migrate` (previously
`db:prod:push`). `db:dev:push` / `db:prod:push` remain available for the
throwaway dev SQLite file only.

## Adopting an existing database (baseline)

Prod predates migrations, so its tables already exist but the migrations journal
doesn't know that. `db:*:baseline` records the existing migrations as
**applied** — inserting their rows into `__drizzle_migrations` **without** running
their SQL — so `migrate` treats the current schema as the starting point:

```bash
bun run db:prod:baseline   # one-time, idempotent (no-op if already adopted)
```

After baselining, `db:prod:migrate` applies only migrations generated _after_ the
baseline.

> **Caveat:** the baseline assumes prod's live schema already matches
> `schema.ts`. Because `push` could never cleanly apply the accumulated schema,
> prod may be missing a few non-critical indexes that `schema.ts` declares (e.g.
> `team_slogan_team_slogan_dupe_guard`). These are not auto-added by baselining;
> add them later with a dedicated, data-checked migration if wanted.

## Files

- `drizzle/0000_baseline.sql` + `drizzle/meta/**` — the baseline migration + snapshots.
- `scripts/baseline-migrations.ts` — the adopt-existing-DB helper.
- `drizzle.config.ts` (prod) / `drizzle-dev.config.ts` (dev) — both write migrations to `./drizzle`.
