# LemonTV AGENTS.md

[AGENTS.md](https://agents.md)

## Tech & Tooling Overview

- **Runtime & build**: SvelteKit 2 on Vite 7 with Svelte 5 runes, bundled and served via Bun (`bun dev`, `bun run build`). 【F:package.json†L1-L43】【F:vite.config.ts†L1-L28】
- **Styling**: Tailwind CSS (utility-first) with small component-specific classes. Avoid large custom CSS and prefer Tailwind utilities. 【F:vite.config.ts†L1-L22】【F:src/lib/components/ui/Switch.svelte†L27-L54】
- **UI Components**: Leverage reusable components under `src/lib/components`. Follow existing patterns such as rune-based props/state management. 【F:src/lib/components/ui/Switch.svelte†L1-L54】
- **Icons**: Use `unplugin-icons` imports (e.g., `~icons/mdi/...`). Avoid raw SVG strings when an icon exists. 【F:.cursor/rules/icons.mdc†L1-L18】
- **Internationalization**: Localized strings come from Paraglide (`$lib/paraglide/messages`, `m[...]` helpers). Never hardcode user-facing copy—use translation keys and update `messages/*.json`. 【F:src/lib/data/game.ts†L1-L44】【F:eslint.config.js†L1-L83】
- **Data & Backend**: Turso/LibSQL database via Drizzle ORM. Use the schema in `src/lib/server/db/schema.ts`, and seed/sync helpers in `src/lib/server/db`. 【F:src/lib/server/db/index.ts†L1-L22】【F:drizzle.config.ts†L1-L15】
- **Auth & hooks**: Request handling flows through `src/hooks.server.ts` (Paraglide middleware, auth session validation, JWKS endpoint). Keep new hooks compatible with this sequence. 【F:src/hooks.server.ts†L1-L93】
- **Testing**: Unit tests use `bun test`; end-to-end uses Playwright (`bun run test:e2e`). Prefer adding targeted unit tests alongside new utilities. 【F:package.json†L44-L83】【F:src/lib/utils/json.test.ts†L1-L31】

## Project Structure (high level)

- `src/routes`: SvelteKit routes. Use `+page.svelte/+page.ts` conventions and keep layout/page props typed with `PageProps`/`LayoutProps`. 【F:.cursor/rules/sveltekit.mdc†L1-L24】
- `src/lib`: Shared code.
  - `components`: UI primitives and feature components. Favor rune-based state, explicit accessibility attributes, and Tailwind class arrays. 【F:src/lib/components/ui/Switch.svelte†L1-L54】
  - `data`: Domain models and static datasets. Co-locate derived helpers with their data definitions. 【F:src/lib/data/game.ts†L1-L44】
  - `server`: Authentication, storage, database schema & seeds, data loaders, and background jobs. Reuse existing helpers instead of duplicating logic. 【F:src/lib/server/db/index.ts†L1-L22】【F:src/hooks.server.ts†L1-L58】
  - `utils`: Framework-agnostic helpers. Ensure new utilities include Bun unit tests like `json.test.ts`. 【F:src/lib/utils/json.test.ts†L1-L31】
- `scripts/`: Bun-based operational scripts (DB sync, stats recalculation, JWT key generation). Run them via `bun run <script>`. 【F:package.json†L12-L83】
- `messages/`: Paraglide translation catalogs. Keep keys in sync with usage and run `bun scripts/check-messages.ts` before shipping i18n changes. 【F:package.json†L12-L83】【F:project.inlang/settings.json†L1-L11】

## Development Workflow

1. **Install dependencies**: `bun i`.
2. **Run the app**: `bun dev` (defaults to port 23355). 【F:README.md†L23-L32】【F:vite.config.ts†L1-L28】
3. **Database**:
   - Development: `bun run db:dev:push` to apply migrations; the dev server seeds and syncs automatically. 【F:README.md†L33-L39】【F:src/hooks.server.ts†L10-L23】
   - Production-related scripts: use the `db:prod:*` commands; never run against prod without confirming env vars. 【F:package.json†L15-L43】
4. **Format code**: `bun run format` to auto-format all files with Prettier (uses default Prettier settings with Svelte plugin configuration). 【F:package.json†L13】
5. **Lint & type-check**: `bun run lint` and `bun run check` before committing. ESLint enforces translation usage and Svelte best practices.
6. **Tests**: `bun run test:unit` for Bun tests; `bun run test:e2e` (Playwright) for browser flows.
7. **Build & deploy**: `bun run build`; production deploy uses `bun run deploy` which chains checks, DB sync, stats recalculation, and Vercel deploy. 【F:package.json†L12-L83】

## Coding Guidelines

- **Use Svelte 5 runes**: Prefer `$state`, `$derived`, `$effect`, and `$bindable` as shown in existing components. Avoid legacy `$:` syntax. 【F:src/lib/components/ui/Switch.svelte†L1-L21】
- **Event handlers**: Use standard DOM properties (`onclick`, `onkeydown`) rather than `on:click`. 【F:src/lib/components/ui/Switch.svelte†L30-L42】
- **Accessibility**: Match established ARIA patterns—e.g., switch/button semantics, keyboard handlers. Validate with accessible roles and states. 【F:src/lib/components/ui/Switch.svelte†L24-L54】
- **Translations**: User-facing text must come from Paraglide messages. If you add text, create a key in `messages/en.json`, run the message checker, and provide translations (or placeholders) for other locales.
- **Data persistence**: Go through Drizzle models; update `schema.ts`, generate migrations, and extend seed/sync utilities if necessary. Never bypass `syncAll`/`seed` logic in dev. 【F:src/lib/server/db/index.ts†L1-L22】【F:src/hooks.server.ts†L10-L23】
- **Security**: Reuse helpers in `src/lib/server/security` and `src/lib/server/auth`. Keep session handling consistent with `handleAuth` in `hooks.server.ts`. 【F:src/hooks.server.ts†L41-L84】
- **Env vars**: Reference variables via `$env/...` modules. Update `.env.example` when introducing new secrets. 【F:.env.example†L1-L23】
- **Testing**: Add/extend Bun tests for utilities and logic. Follow the pattern in `src/lib/utils/json.test.ts` (describe/it with `bun:test`). 【F:src/lib/utils/json.test.ts†L1-L31】

## Internationalization Process

1. Add/update keys in `messages/en.json` and run `bun scripts/check-messages.ts` to ensure coverage. 【F:package.json†L33-L38】
2. Update other locale files or leave TODO comments for translators (but keep JSON valid).
3. Use the generated helpers (e.g., `m['some.key']`) in code and call them as functions to get localized strings. 【F:src/lib/data/game.ts†L16-L44】
4. Remember the ESLint rule `lemon-i18n/no-untranslated-text` will warn on hardcoded text in Svelte files. 【F:eslint.config.js†L29-L83】

## Database & Background Jobs

- Database connections switch between local file storage in dev and Turso in prod. Ensure `DATABASE_URL`/`DATABASE_AUTH_TOKEN` are configured. 【F:src/lib/server/db/index.ts†L1-L22】【F:drizzle.config.ts†L1-L15】
- `syncAll` keeps enum-like tables aligned; `seed` populates baseline data; player stats recalculation is triggered during dev server init. Respect this pipeline when adding new derived data jobs. 【F:src/hooks.server.ts†L10-L23】

## Deployment Notes

- Manual deploy via `bun run deploy` runs checks, rebuilds, pushes schema, syncs data, recalculates player stats, and then deploys to Vercel. Coordinate schema changes carefully and keep `.env` secrets up-to-date. 【F:package.json†L12-L83】【F:README.md†L40-L47】

Happy hacking! When in doubt, look for existing patterns in `src/lib` and follow their conventions before introducing new abstractions.
