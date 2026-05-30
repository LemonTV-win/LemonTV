/**
 * Adopt an existing database into the Drizzle migrations journal.
 *
 * Our prod DB predates migrations (it was managed with `drizzle-kit push`,
 * which on Turso/libSQL spuriously wants to rebuild every table on each run).
 * This marks the already-present migrations as applied — by inserting their
 * rows into `__drizzle_migrations` WITHOUT running their SQL — so that
 * `drizzle-kit migrate` treats the current schema as the baseline and only
 * applies genuinely new migrations going forward.
 *
 * Idempotent: does nothing if `__drizzle_migrations` already has rows.
 *
 * Usage:
 *   bun run db:dev:baseline    # adopt local dev.db
 *   bun run db:prod:baseline   # adopt prod (needs DATABASE_URL/AUTH_TOKEN)
 */
import { createClient } from '@libsql/client';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

interface JournalEntry {
	idx: number;
	when: number;
	tag: string;
}

const MIGRATIONS_DIR = path.join(import.meta.dir, '..', 'drizzle');
const journalPath = path.join(MIGRATIONS_DIR, 'meta', '_journal.json');
const journal = JSON.parse(readFileSync(journalPath, 'utf8')) as { entries: JournalEntry[] };

if (!journal.entries?.length) {
	console.error(
		'[Baseline] No migrations found in drizzle/meta/_journal.json — run `bun run db:generate` first.'
	);
	process.exit(1);
}

const isDev = import.meta.env.DEV === 'true';
const client = isDev
	? createClient({ url: 'file:./dev.db' })
	: createClient({
			url: import.meta.env.DATABASE_URL as string,
			authToken: import.meta.env.DATABASE_AUTH_TOKEN as string
		});

console.info(
	`[Baseline] Target: ${isDev ? 'DEV (file:./dev.db)' : `PROD (${import.meta.env.DATABASE_NAME})`}`
);

// Matches the table definition in drizzle-orm/libsql migrator exactly.
await client.execute(
	'CREATE TABLE IF NOT EXISTS `__drizzle_migrations` (id SERIAL PRIMARY KEY, hash text NOT NULL, created_at numeric)'
);

const countResult = await client.execute('SELECT count(*) AS n FROM `__drizzle_migrations`');
const existing = Number(countResult.rows[0]?.n ?? 0);
if (existing > 0) {
	console.info(
		`[Baseline] __drizzle_migrations already has ${existing} row(s) — already adopted, nothing to do.`
	);
	process.exit(0);
}

for (const entry of journal.entries) {
	const content = readFileSync(path.join(MIGRATIONS_DIR, `${entry.tag}.sql`), 'utf8');
	const hash = createHash('sha256').update(content).digest('hex');
	await client.execute({
		sql: 'INSERT INTO `__drizzle_migrations` ("hash", "created_at") VALUES (?, ?)',
		args: [hash, entry.when]
	});
	console.info(`[Baseline] Marked ${entry.tag} as applied (when=${entry.when}).`);
}

console.info(
	'[Baseline] Done. Current schema adopted as the migration baseline; `drizzle-kit migrate` now applies only NEW migrations.'
);
process.exit(0);
