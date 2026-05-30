<!--
  LemonTV Sunset Plan
  Synthesized 2026-05-31 via a multi-agent codebase analysis.
  This document is the roadmap for opening LemonTV up as the maintainer steps back.
-->

# Locked decisions (2026-05-31)

These four architecture decisions are settled; the rest of this document elaborates them.

| #   | Decision                          | Choice                                                                                                                        |
| --- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 1   | AI edits by authorized editors    | **Go live immediately, fully attributed** (editors are trusted; the proposal queue is for the open-edit _proposer_ tier only) |
| 2   | MCP Personal Access Token ceiling | **Capped at `editor`** — no `admin`/user-role management via the AI path                                                      |
| 3   | Dataset license                   | **CC BY 4.0** (code stays **MIT**)                                                                                            |
| 4   | MCP topology                      | **In-process SvelteKit route** at `/api/mcp` (not a separate Worker)                                                          |

Still open and owner-dependent: AI-edit policy for the _open-edit_ tier, auto-promotion thresholds, pagination style, exact public field set, and — critically — **data provenance** (whether any data is third-party-scraped, which constrains what CC BY 4.0 can actually cover). See "Open questions" at the end.

# LemonTV Master Plan: Authorized MCP Server, Open Editing, and a CC-Licensed Public API

## Executive summary

LemonTV is a one-maintainer SvelteKit app whose esports dataset is worth opening up, but whose owner is stepping back from active development. The goal is to let the project **outlive hands-on maintenance**: authorized editors should manage data through AI, the wider community should be able to contribute wiki-style under monitoring, and successor projects (StrinovaHub, Stringify) should be able to reuse the data freely with credit.

The good news, grounded in the codebase: roughly **80% of the machinery already exists**, just wired for a closed admin-only world. There is a clean, framework-agnostic data-access layer (`src/lib/server/data/*.ts`), a field-level audit trail (`edit_history`), a two-role RBAC (`checkPermissions`), JWT/JWKS SSO, and a pre-reserved `/api/public/` route prefix. The three pillars are not three separate systems — they are **three callers of one shared service layer, one audit log, and one zod contract**.

The single most important sequencing decision: **the smallest safe path to "editing via AI" is the centerpiece, and it depends on a handful of pre-existing security gaps being closed first.** Everything else (open editing, public API, CC licensing) layers onto the same foundation.

---

## Current state (grounded in the real stack)

| Concern          | Reality                                                                                   | Key files                                                                                 |
| ---------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Framework        | SvelteKit 2 / Svelte 5 runes, Vite 7, Bun, Vercel adapter                                 | `svelte.config.js`, `vercel.json`                                                         |
| Database         | Turso/libSQL (SQLite) via Drizzle ORM 0.45; dev uses `file:./dev.db`                      | `src/lib/server/db/index.ts`, `drizzle.config.ts`, `drizzle-dev.config.ts`                |
| Schema           | ~47 tables, code-first, **no migrations** (push-based)                                    | `src/lib/server/db/schema.ts`, `src/lib/server/db/schemas/{auth,game,about,edit-history}` |
| Read/write logic | Framework-agnostic typed functions, the canonical API                                     | `src/lib/server/data/{players,teams,events,matches,organizers,community,users,stats}.ts`  |
| Audit trail      | Field-level `oldValue/newValue/editedBy/editedAt`, viewer at `/admin/edit-history`        | `src/lib/server/db/schemas/edit-history.ts`                                               |
| Auth             | Custom Lucia-style sessions (Oslo + argon2), opaque tokens, HttpOnly cookie               | `src/lib/server/auth.ts`, `src/hooks.server.ts`                                           |
| RBAC             | Exactly two roles: `admin`, `editor`; the one reusable gate                               | `src/lib/server/security/permission.ts`, `src/lib/server/db/sync.ts`                      |
| SSO              | ES256 JWT issuance + JWKS discovery (jose)                                                | `src/routes/(user)/login/jwt/+server.ts`, `src/hooks.server.ts` (handleJWKS)              |
| Validation       | zod used **only** for auth; domain writes use ad-hoc guards + `as` casts                  | `src/lib/validations/auth.ts`                                                             |
| Public API       | `/api/public/` is **whitelisted in `src/hooks.server.ts:50`** but **no route exists yet** | (must be created)                                                                         |
| Storage          | S3-compatible, 1h presigned URLs                                                          | `src/lib/server/storage.ts`                                                               |
| Cost / abuse     | ~$1,200/yr; **no rate limiting, captcha, or caching anywhere** except JWKS                | `README.md`, `.github/FUNDING.yml`                                                        |
| Licensing        | **No LICENSE file at all** — repo is all-rights-reserved by default                       | (must be created)                                                                         |

### Three structural facts that shape everything

1. **The data layer is split in maturity.** Players (`src/lib/server/data/players.ts`: `createPlayer` @960, `updatePlayer` @1151, `deletePlayer` @1453) and Teams (`src/lib/server/data/teams.ts`: @745/@933/@1236) have **clean, transactional, `(data, editedBy, tx?)` service functions that emit `edit_history`**. Events expose only `updateEventTeamPlayers` (@1181) and `updateEventCasters` (@1224); **event/match/organizer/game create/update/delete logic is trapped inline inside `+page.server.ts` actions** (`src/routes/(user)/admin/events/+page.server.ts`, `src/routes/(user)/admin/matches/[eventId]/+page.server.ts`). This single fact dictates v1 write scope everywhere.

2. **Authorization lives only in the route layer.** `checkPermissions(locals, ['admin','editor'])` (`src/lib/server/security/permission.ts:7`) gates form actions. The service functions **trust their caller-supplied `editedBy` and perform no role check** (`createPlayer` @960 only inserts `edit_history`). Any non-route caller — MCP, scripts, proposal appliers — **must enforce authorization itself**.

3. **Pre-existing security gaps will be amplified by any exposure.** These are prerequisites, not optional:
   - `/admin/users/+page.server.ts` and `/admin/community/+page.server.ts` POST actions **do not re-check permissions inside the action** (rely on the load guard, which does not protect POSTs — a privilege-escalation gap).
   - `POST /api/upload/+server.ts` and `GET /api/upload/[...key]/+server.ts` are **fully unauthenticated** (arbitrary S3 writes + signed-URL minting).
   - `GET /api/events/[id]/history/+server.ts` is **unauthenticated and leaks editor emails**, unlike the role-gated players/teams history endpoints.

---

## Unifying architecture: one service layer, one audit log, one contract

All three pillars converge on a shared spine. Build these once; every pillar reuses them.

```
                        ┌─────────────────────────────────────────────┐
   AI client (PAT) ───► │  MCP endpoint  /api/mcp  (+server.ts)        │
   Web UI (session) ──► │  Open-edit gateway  submitChange()          │ ─┐
   Public reader ─────► │  Public API  /api/public/v1/* (read-only)   │  │
                        └─────────────────────────────────────────────┘  │
                                          │ enforce auth here (route layer)│
                                          ▼                                │
   ONE zod CONTRACT  ──►  validate inputs / project outputs (PII whitelist)│
   src/lib/server/contract/*.ts                                           │
                                          ▼                                │
   ONE SERVICE LAYER  ──►  src/lib/server/data/*.ts  (data, editedBy, tx?)│
                                          ▼                                │
   ONE AUDIT LOG  ──►  edit_history (field diffs)  +  mcp_audit_log        │
   src/lib/server/db/schemas/edit-history.ts        (denials/reads/limits) │◄┘
```

- **One service layer:** `src/lib/server/data/*.ts`. Reads back the public API and MCP read tools; writes back MCP write tools and the open-edit gateway. Where service functions are missing (events/matches/organizers/games), they **must be extracted from the inline actions** before those entities are writable by anything other than the admin UI.
- **One audit log:** `edit_history` records every successful field-level change keyed by `editedBy`. A new `mcp_audit_log` table (must be created) records what `edit_history` cannot — reads, denials, validation failures, rate-limit hits — keyed by token. AI-origin edits get a `_source='mcp:<tool>'` marker row in `edit_history` so the existing `/admin/edit-history` viewer distinguishes them.
- **One typed contract:** a new `src/lib/server/contract/*.ts` zod package (must be created; zod v4 is already a dependency per `src/lib/validations/auth.ts`). The same schemas drive MCP tool `inputSchema`, MCP/REST response projection (the PII whitelist), and the public OpenAPI doc — so the surfaces **cannot drift**.

The single rule that keeps this safe: **no caller touches Drizzle or a service function directly without passing through the contract + an authorization check.** Pushing `checkPermissions` down into the data layer is the cleaner long-term fix but touches every existing form-action caller; for v1 the boundary is enforced at each entry point.

---

## Pillar 1 — Authorized MCP server (centerpiece)

**Goal:** authorized editors manage data via AI (Claude Desktop/Code) through a single bearer token, with every AI edit attributed to one real human and fully auditable.

### Shape

An **in-process** MCP server mounted as a SvelteKit route at **`src/routes/api/mcp/+server.ts`** (must be created), implementing the Streamable HTTP transport via `@modelcontextprotocol/sdk` (a new dependency — greenfield). It calls `src/lib/server/data/*.ts` directly with the shared Drizzle `db`, so reads and writes get identical normalized output and free `edit_history` attribution.

**Critical placement:** mounted under `/api/mcp`, **NOT** under `/api/public/`. The `/api/public/` prefix (`src/hooks.server.ts:50`) sets `locals.user=null` and returns before any auth — a write surface there would be unauthenticated by default. `/api/` is already excluded from Paraglide i18n (`src/hooks.server.ts:29`), so `/api/mcp` needs no pipeline change and authenticates itself from the `Authorization` header.

### Centerpiece decision: identity model

**Decision:** a new revocable, scoped, hashed **Personal Access Token** (`mcp_token` table, must be created), minted by an editor from their own profile, bound to one real `user.id` and that user's roles.

It reuses the exact session primitive: `generateSessionToken` (`src/lib/server/auth.ts:57`, 18 random bytes → base64url) + `sha256` + `encodeHexLowerCase` (`auth.ts:64,84`), with a `lemon_pat_` display prefix. Plaintext shown once at creation; only the hash is stored.

| Alternative                                 | Why rejected                                                                                                                                                                                                                                       |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reuse the existing ES256 SSO JWT for writes | Delivered via `?token=` query param (`login/jwt/+server.ts:66`, leaks to logs); roles frozen at issuance; **7-day lifetime, no revocation list** — a de-authorized editor keeps write access for up to a week. Unsafe for an automated write path. |
| Full OAuth 2.1 + PKCE (MCP spec)            | Auth server + client registration + consent UI = weeks of work for a one-dev fan project.                                                                                                                                                          |
| Reuse session cookies                       | HttpOnly cookies are not ergonomic for headless AI clients.                                                                                                                                                                                        |

The JWT/JWKS path (`src/hooks.server.ts` handleJWKS) is **kept only as an optional read-only bearer**, never for writes.

### What to build vs reuse

| Component                                                                         | Build / Reuse                      | Files                                                                                                                                                                                                                                                                        |
| --------------------------------------------------------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mcp_token` schema (scoped, revocable, hashed PAT)                                | **Build**                          | `src/lib/server/db/schemas/auth/mcp-token.ts`; re-export via `…/auth/index.ts`, `…/schemas/index.ts`                                                                                                                                                                         |
| `mcp_audit_log` schema (reads/denials/rate-limit)                                 | **Build**                          | `src/lib/server/db/schemas/auth/mcp-audit-log.ts`                                                                                                                                                                                                                            |
| `mcp_rate_limit` (token-bucket counters)                                          | **Build**                          | `src/lib/server/db/schemas/auth/mcp-rate-limit.ts`                                                                                                                                                                                                                           |
| PAT service (`createMcpToken`/`validateMcpToken`/`revokeMcpToken`/`listMcpToken`) | **Build**, mirroring session funcs | `src/lib/server/security/mcp-token.ts` (reuses `auth.ts:57,64`, role query `auth.ts:107-110`)                                                                                                                                                                                |
| MCP endpoint + transport                                                          | **Build**                          | `src/routes/api/mcp/+server.ts`, `src/lib/server/mcp/server.ts`, `src/lib/server/mcp/identity.ts`                                                                                                                                                                            |
| MCP guard (role + scope + rate limit, deny-by-default)                            | **Build**                          | `src/lib/server/mcp/guard.ts` (replicates `permission.ts:7` semantics)                                                                                                                                                                                                       |
| Read tools (PII-projected)                                                        | **Build wrappers**, reuse getters  | `src/lib/server/mcp/tools/read.ts` over `getPlayers/getPlayer/getPlayerStats/getPlayerDetailedMatches`, `getTeams/getTeam/getTeamStatistics`, `getEssentialEvents/getEvent`, `getMatch` (first programmatic surface — no HTTP endpoint exists), `getOrganizers/getOrganizer` |
| Write tools v1 (players, teams, event roster/casters)                             | **Build wrappers**, reuse services | `src/lib/server/mcp/tools/write.ts` → `createPlayer/updatePlayer/deletePlayer`, `createTeam/updateTeam/deleteTeam`, `updateEventTeamPlayers/updateEventCasters`                                                                                                              |
| zod contract package                                                              | **Build**                          | `src/lib/server/contract/{players,teams,events,index}.ts`                                                                                                                                                                                                                    |
| Rate limiter (token-bucket per PAT)                                               | **Build**                          | `src/lib/server/security/rate-limit.ts`                                                                                                                                                                                                                                      |
| PAT dashboard                                                                     | **Build**                          | `src/routes/(user)/profile/mcp-tokens/+page.{server.ts,svelte}`                                                                                                                                                                                                              |
| Moderation/audit viewer                                                           | **Build**                          | `src/routes/(user)/admin/mcp-log/+page.server.ts`                                                                                                                                                                                                                            |

### Key decisions

- **Re-check authorization inside every write tool.** A single mandatory `guard.ts` runs before dispatch: (1) `checkPermissions`-equivalent on the PAT's resolved roles (`editor`|`admin`); (2) per-token scope check (least privilege); (3) deny all user/role management tools (mirroring `/admin/users` being admin-only); (4) token-bucket rate limit. On failure, write a `denied` row to `mcp_audit_log` and return a JSON-RPC error. _Rejected alternative:_ pushing `checkPermissions` into the data layer — correct long-term, but touches every form-action caller; out of scope for v1.
- **Editors can only mint tokens scoped to roles they already hold.** An editor cannot create an admin token. Cap discussion is an open question.
- **Tag AI edits.** Successful writes get a `_source='mcp:<tool>'` marker in `edit_history` so `/admin/edit-history` distinguishes AI from human-UI edits.
- **v1 write coverage = players + teams + event roster/casters only**, because those are the only entities with clean service functions. POST-emulating form actions is **explicitly rejected** (brittle, bypasses validation, produces weak/no `edit_history`).

---

## Pillar 2 — Open editing + moderation (wiki-style)

**Goal:** let logged-in non-editors contribute, under monitoring, **without increasing the owner's ongoing workload.**

### Core model

Add exactly **one new tier**, **one new table**, and **one write gateway**.

- **Tiers** (only the proposer tier is new; it needs no DB role row — it is simply "logged-in but lacks `editor`/`admin`"):

  | Tier                 | Who                             | Capability                                             |
  | -------------------- | ------------------------------- | ------------------------------------------------------ |
  | Anonymous            | logged-out                      | read-only                                              |
  | **Proposer** _(new)_ | logged-in, no editor/admin role | submissions **queue** as proposals                     |
  | Trusted editor       | existing `editor`               | **direct writes go live**; can review proposals        |
  | Admin                | existing `admin`                | everything incl. user/role mgmt, bulk revert, blocking |

- **`change_proposal` table** (must be created, modeled on `edit-history.ts`): `tableName`, `recordId` (nullable for creates), `operation`, `payload` (JSON = the exact argument object the service functions accept), `proposedBy`, `status`, `reviewedBy`, `reviewNote`, `source` (`web`|`mcp`), timestamps. **A proposal is a deferred service call:** approval = call `createPlayer/updatePlayer/…` with `editedBy = the original proposer` inside the reviewer's transaction, so attribution stays correct and there is **no second write engine**.

- **One write gateway** `submitChange(input, actor)` (`src/lib/server/data/changes.ts`, must be created): resolves the actor's tier; trusted/admin → validate + call the service directly (live); proposer → validate + insert a pending `change_proposal`. The MCP server, the web forms, and the proposal applier **all funnel through this one gateway** — so nothing can bypass moderation, and `edit_history` is guaranteed.

### Decisions

| Decision                                                                   | Rationale                                                                                                          | Rejected                                                                                                              |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Queue only for proposers; keep direct-write for editors                    | Owner is winding down — review load must fall **only** on untrusted/new contributors (the "autoconfirmed" pattern) | Everyone-proposes (too much reviewer load); everyone-writes + post-hoc patrol (unsustainable, exposes live vandalism) |
| Proposals store service-function arguments, applied via the same functions | Zero duplication of write logic or audit instrumentation                                                           | Shadow per-table pending rows; raw SQL (unsafe)                                                                       |
| Add soft-delete `deletedAt` to player/team/event                           | Deletion vandalism is otherwise only recoverable by fragile `edit_history` replay                                  | Pure replay (brittle for sparsely-audited inline entities)                                                            |
| Auto-promote proposers to `editor` after K approved edits                  | Keeps the maintainer's steady-state review load near zero                                                          | Manual-only promotion (more owner work)                                                                               |

### Build vs reuse

- **Reuse:** `checkPermissions`, the players/teams service functions, `edit_history`, the existing diff rendering in `src/routes/(user)/admin/EditHistory.svelte`, the JWT/JWKS for MCP-origin proposals.
- **Build:** the `proposer` tier resolver; `change_proposal` table; `submitChange` gateway; `applyProposal`/`rejectProposal`; **revert** (`revertEdit`/`revertRecordToTimestamp` applying old `edit_history` values via service updates — logged as new edits, never deleting history); soft-delete columns; a minimal moderation queue at `src/routes/(user)/admin/moderation/` (approve/reject/bulk/block/promote, each with **inner** `checkPermissions`); per-entity zod schemas; and the anti-abuse layer (rate limiting in `src/hooks.server.ts`, captcha on register + new-account proposals).
- **Must refactor first:** events/matches/organizers inline write logic into service functions before those entities are proposable. Until then they stay editor/admin-only.

---

## Pillar 3 — Public read API + CC licensing

**Goal:** make the dataset publicly reusable and legally clear so successor projects can build on it with credit.

### API shape

A **versioned, read-only** JSON API at **`/api/public/v1/*`** — the pre-blessed mount point (`src/hooks.server.ts:50` already whitelists `/api/public/` from auth; `:29` excludes `/api/` from i18n). Each `+server.ts` GET handler (must be created) calls the data-layer getter in-process, **projects through a zod response schema (the PII whitelist)**, sets `Cache-Control`, and returns `json()`.

Resources (slug- or id-addressable, matching `getPlayer(keyword)`/`getTeam(slug)`/`getEvent(idOrSlug)` ergonomics): `players[/{slug}[/stats|/matches]]`, `teams[/{slug}[/matches]]`, `events[/{idOrSlug}]`, `matches/{id}`, `organizers[/{slug}]`, `community/discord-servers`, `meta/maps`, `meta/characters`, plus `openapi.json`, `dump`, and `license`.

### Decisions

| Decision                                                                                                                    | Rationale                                                                                                                                                                                                                                           | Rejected                                                                                                                                                     |
| --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Mount at `/api/public/v1/*`, in-process over the data layer                                                                 | Zero pipeline change; identical normalized output; path versioning is cache-friendly                                                                                                                                                                | Separate Worker (splits topology); tRPC/GraphQL (not in stack); reusing scattered `/api/events/[id]/*` (raw rows, leak emails, unversioned)                  |
| **zod = single source of truth** for response schemas → OpenAPI 3.1 + MCP tool schemas                                      | zod v4's `z.toJSONSchema()` generates the OpenAPI doc; the MCP server reads the same schemas, so **REST and MCP cannot drift**                                                                                                                      | Hand-authored OpenAPI (drifts); `drizzle-zod` (mirrors DB columns incl. PII)                                                                                 |
| **Explicit field-whitelist** — never expose `user.email`, `user.id` linkage, `passwordHash`, edit-history editor identities | Data-layer App objects include `user?: User` and several endpoints join `user.email`; verbatim return leaks PII                                                                                                                                     | Trusting the data layer's shape                                                                                                                              |
| **CC BY 4.0** for the dataset; separate code license (MIT vs AGPL TBD)                                                      | Facts aren't copyrightable in the US, but EU/UK **sui generis database right** + compilation copyright do apply; CC BY 4.0 explicitly licenses database rights (3.0 does not) and requires attribution to LemonTV — serving the owner's credit goal | CC0 (no attribution — documented fallback); **CC BY-SA (viral share-alike deters commercial successors — not recommended)**; ODbL (heavier, less understood) |
| Caching-first cost control + token-bucket on uncached routes                                                                | Owner cares about ~$1,200/yr; Turso bills per row-read; CDN turns repeat reads into zero Turso reads                                                                                                                                                | Redis/Upstash limiter (overkill); no caching (multiplies cost under scrapers)                                                                                |
| Nightly bulk dump (JSON + JSON-Lines + SQL) under the same license                                                          | Cheaper than full-table scans; canonical CC artifact for mirroring                                                                                                                                                                                  | API-only (pushes cost to live queries)                                                                                                                       |

### Build vs reuse

- **Reuse:** all data-layer getters; `processImageURL` (`storage.ts`) for image resolution; the JWKS `Cache-Control` pattern (`hooks.server.ts:108`); the existing `db:prod:dump` SQL dump.
- **Build:** public zod schemas (`src/lib/server/api/public/schemas/*`), OpenAPI generator + `/openapi.json` route, pagination/serialization helpers, per-IP rate limiter, bulk-dump publisher (`scripts/publish-public-dump.ts` + a Vercel cron in `vercel.json`), and the licensing files (`LICENSE`, `LICENSE-DATA.md`, README data-vs-code section, `/api/public/v1/license`, `Link: rel="license"` header).
- **Image caveat:** presigned URLs expire in 1h (`storage.ts:42`); cache TTL on image-bearing routes **must be < 1h**, or return stable keys + a documented resolver.

---

## Phased roadmap (biased to the smallest safe path to editing-via-AI)

The ordering principle: **close the gaps the MCP RBAC would inherit, then ship the MCP centerpiece on players+teams, then layer open editing and the public API on the same spine.** Open editing and the public API both depend on Phase 0 too — doing it once unblocks all three.

### Phase 0 — Security + legal prerequisites (must precede _any_ exposure)

- Add inner `checkPermissions` to every POST action in `/admin/users/+page.server.ts` and `/admin/community/+page.server.ts`.
- Gate `POST /api/upload` and `GET /api/upload/[...key]` behind `checkPermissions(['admin','editor'])` + file type/size validation.
- Role-gate `GET /api/events/[id]/history` (stop leaking editor emails).
- Confirm `seed()` is strictly dev-gated (`src/hooks.server.ts:13`, behind `dev`) so no shared/test write path triggers a destructive reseed.
- Add a CODE `LICENSE` and a `LICENSE-DATA.md` (CC BY 4.0) + README data-vs-code/provenance note. _(Hard blocker for the public-API framing; cheap to do now.)_

### Phase 1 — MCP foundation (the centerpiece, smallest safe AI-editing path)

- Add `mcp_token`, `mcp_audit_log`, `mcp_rate_limit` schemas; `drizzle-kit push` to dev then prod (additive, low-risk).
- Implement `src/lib/server/security/mcp-token.ts` + unit test beside `permission.test.ts`.
- Build the zod contract for players + teams (`src/lib/server/contract/*`).
- Build `/profile/mcp-tokens` dashboard (one-time plaintext reveal, scopes ≤ own roles, expiry, revoke).

### Phase 2 — MCP server + read tools

- Add `@modelcontextprotocol/sdk`; create `src/routes/api/mcp/+server.ts` (confirm **not** under `/api/public/`).
- Implement the tool registry + read tools over all getters, with the contract PII whitelist applied to every response.

### Phase 3 — MCP write tools (players + teams + event roster/casters)

- Implement `guard.ts` (role + scope + rate limit, deny-by-default) and `tools/write.ts`.
- Wire the token-bucket limiter (fail-safe deny). Verify `edit_history` rows + `_source='mcp:<tool>'` markers appear.
- Build `/admin/mcp-log` viewer with one-click revoke. **At this point, authorized editing via AI is live, safe, and auditable.**

### Phase 4 — Public read API + CC licensing

- Build public zod schemas, OpenAPI generator, pagination + cache helpers, and the `/api/public/v1/*` read endpoints (cached, field-whitelisted, paginated).
- Serve `/openapi.json` and `/license`; add the `Link: rel="license"` header and per-IP limiter on uncached routes.
- Ship the nightly bulk-dump publisher + cron.

### Phase 5 — Open editing + moderation

- Build the `submitChange` gateway and refactor admin players/teams actions to route through it (behavior identical for editors).
- Add `change_proposal`, the proposer tier, `applyProposal`/`rejectProposal`, and the `/admin/moderation` queue.
- Add revert + soft-delete (`deletedAt`) + rate limiting in `hooks.server.ts` + captcha on register/new-account proposals + auto-promotion.

### Phase 6 — Write-coverage expansion (follow-up)

- Extract `createEvent/updateEvent/deleteEvent` (and matches/stages/games, organizers) from the inline `+page.server.ts` actions into `(data, editedBy, tx?)` service functions; repoint the form actions.
- Add contract write schemas and register `events.*`/`matches.*`/`organizers.*`/`games.*` MCP tools and proposal support behind the same guard — no new auth/transport work.
- Optional: optimistic-concurrency (`updatedAt` compare-and-swap) on high-contention entities before heavy concurrent AI use.

---

## Risks & abuse surface

- **Service functions do no authorization** (`createPlayer` @960 trusts caller `editedBy`). If the guard/gateway is bypassed, an under-privileged token/identity gains full editor write access. _Mitigation:_ one mandatory guard, deny-by-default registry, code review that no tool/caller hits a service without the guard.
- **No rate limiting / captcha / caching exists today** (except JWKS). Any public, open-edit, or MCP surface inherits this. _Mitigation:_ land anti-abuse in the **same phase** as each surface, never after; bulk dump as the pressure-relief valve for heavy consumers.
- **PII leakage** is the single most important correctness boundary. Data-layer readers join `user.email`/`userId`. _Mitigation:_ enforce the contract read schema on **every** response centrally; never return raw objects; cover with tests.
- **Pre-existing auth gaps** (`/admin/users`, `/admin/community`, `/api/upload`, `/api/events/[id]/history`) become privilege-escalation/cost-abuse vectors once anything is advertised. Phase 0 fixes are non-negotiable.
- **7-day non-revocable JWTs** make role revocation/blocking ineffective for that token until expiry — hence PATs (instant revoke) for the write path.
- **No optimistic concurrency** anywhere: AI + human editing the same record silently last-write-wins; AI frequency raises collision odds.
- **No soft-delete today**: deletion vandalism is hard to revert, especially for sparsely-audited inline entities.
- **Stats staleness:** `player_stats`/`player_character_stats` refresh only via the 02:00 UTC cron (`/api/cron/recalculate-player-stats`); stats endpoints/tools must flag a "last recalculated" timestamp.
- **Push-based schema, no migrations:** new `mcp_*`/`change_proposal`/soft-delete columns are additive (low risk) but there is no rollback path — coordinate with `db:prod:dump` backup.
- **Image URL expiry (1h):** caching image-bearing responses longer than the presign window serves dead links.
- **No LICENSE blocks the "open" framing** entirely until Phase 0; and **data provenance** (any scraped third-party data?) may constrain what can be CC-licensed at all.
- **Cross-server casing** (`event.server` `'calabiyau'|'strinova'` vs `game_account.server` `'CalabiYau'|'Strinova'`) and `game_player_score.accountId` having no FK must be normalized in the contract.

---

## Open questions for the owner

**Identity & scope (MCP)**

1. May an MCP PAT ever carry the `admin` scope, or is it capped at `editor` to keep user/role management out of the AI path?
2. Confirm token defaults: prefix `lemon_pat_`, default expiry (e.g. 90 days), and whether non-expiring tokens are allowed for trusted long-running clients.
3. Should `mcp_audit_log` redact tool args by default (privacy) or store full args (forensic moderation)?
4. Rate-limit storage: Turso-backed counters (durable, costs reads) or in-memory per-instance (cheaper, less accurate under Vercel concurrency)?

**Editing policy (open-edit + MCP)** 5. Should AI-originated edits go live immediately (current direct-write model, attributed) or pass through the proposal queue? Equivalently: does an AI act as a per-user identity whose edits **queue** (human-in-the-loop), or as a granted `editor` (live writes)? _This is the biggest safety lever._ 6. Which entities are open-editable by proposers in v1 — players/teams only, or also curation-sensitive `event_team` status/results/casters? 7. Auto-promotion: after how many approved proposals (over what window) does a proposer become trusted, and automatic or admin-confirmed? 8. Is there a `trusted` role between proposer and `editor`, or is `editor` reused as trusted-editor (lowest effort)?

**Public API & licensing** 9. Final dataset license: **CC BY 4.0** (recommended, attribution) vs **CC0** (max reuse) vs CC BY-SA (not recommended)? And the separate code license (MIT vs AGPL-3.0)? 10. **Data provenance:** is any esports data scraped from third parties? This affects whether CC can be granted for those fields at all. 11. Pagination style for v1: page/limit (simple) or opaque cursor (robust under concurrent edits)? 12. Exact public field set — expose `game_account.accountId` and any player↔user linkage at all? 13. Should the bulk dump be the **primary** recommended path for heavy/AI consumers, with the live API rate-limited harder?

**Operational confirmations** 14. Confirm the Phase 0 fixes (`/admin/users` + `/admin/community` inner checks, unauthenticated `/api/upload`, unauthenticated `/api/events/[id]/history`) are bugs to fix, not intentional internal flows. 15. In-process SvelteKit `/api/mcp` (recommended) vs a separate Cloudflare Worker (splits topology, requires HTTP callbacks)? 16. Is adding soft-delete (`deletedAt`) acceptable given push-only schema changes touch read queries across the data layer?
