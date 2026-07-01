// Check the database for data-integrity problems that the schema does not (yet)
// enforce. Read-only: this script never mutates data.
//
// Currently checks:
//   1. Duplicate slugs on teams/players/events/organizers. Slugs are used as
//      URL keys (e.g. /teams/[slug]); duplicates make one record unreachable
//      because the route handler resolves a slug with findFirst.
//   2. Event `date` values that fail to parse, have end-before-start, or span
//      an implausibly long period (likely a year typo in the end date).
//
// Usage:
//   bun run scripts/check-data-integrity.ts            # dev.db
//   cross-env DEV=false bun run scripts/check-data-integrity.ts   # production
//
// Exits with code 1 if any errors are found (warnings do not fail the run).

import chalk from 'chalk';
import { db } from './lib/db';
import * as schema from '../src/lib/server/db/schema';
import { safeParseDateRange } from '../src/lib/utils/date';

const tag = chalk.blue('[Check Data Integrity]');
let errorCount = 0;
let warningCount = 0;

// A range longer than this is almost always a typo (e.g. 2024-07-28/2025-07-28).
const SUSPICIOUS_RANGE_DAYS = 200;
const DAY_MS = 24 * 60 * 60 * 1000;

function reportDuplicateSlugs(
	label: string,
	rows: Array<{ id: string; slug: string; name: string }>
): void {
	const bySlug = new Map<string, Array<{ id: string; name: string }>>();
	for (const row of rows) {
		const list = bySlug.get(row.slug) ?? [];
		list.push({ id: row.id, name: row.name });
		bySlug.set(row.slug, list);
	}

	const duplicates = [...bySlug.entries()].filter(([, list]) => list.length > 1);
	if (duplicates.length === 0) {
		console.log(tag, chalk.green(`✓ ${label}: no duplicate slugs (${rows.length} rows)`));
		return;
	}

	errorCount += duplicates.length;
	console.log(tag, chalk.red(`✗ ${label}: ${duplicates.length} duplicate slug(s)`));
	for (const [slug, list] of duplicates) {
		console.log(`    ${chalk.yellow(slug)}`);
		for (const { id, name } of list) {
			console.log(`      - ${id}  ${chalk.gray(JSON.stringify(name))}`);
		}
	}
}

async function checkSlugs(): Promise<void> {
	const [teams, players, events, organizers] = await Promise.all([
		db.select({ id: schema.team.id, slug: schema.team.slug, name: schema.team.name }).from(schema.team),
		db
			.select({ id: schema.player.id, slug: schema.player.slug, name: schema.player.name })
			.from(schema.player),
		db.select({ id: schema.event.id, slug: schema.event.slug, name: schema.event.name }).from(schema.event),
		db
			.select({ id: schema.organizer.id, slug: schema.organizer.slug, name: schema.organizer.name })
			.from(schema.organizer)
	]);

	reportDuplicateSlugs('Teams', teams);
	reportDuplicateSlugs('Players', players);
	reportDuplicateSlugs('Events', events);
	reportDuplicateSlugs('Organizers', organizers);
}

async function checkEventDates(): Promise<void> {
	const events = await db
		.select({ id: schema.event.id, slug: schema.event.slug, date: schema.event.date })
		.from(schema.event);

	const problems: string[] = [];
	for (const event of events) {
		const range = safeParseDateRange(event.date);
		if (!range) {
			errorCount += 1;
			problems.push(`    ${chalk.red('unparseable')} ${event.slug}: ${JSON.stringify(event.date)}`);
			continue;
		}
		if (!range.end) continue;

		if (range.end.getTime() < range.start.getTime()) {
			errorCount += 1;
			problems.push(`    ${chalk.red('end before start')} ${event.slug}: ${event.date}`);
			continue;
		}

		const spanDays = Math.round((range.end.getTime() - range.start.getTime()) / DAY_MS);
		if (spanDays > SUSPICIOUS_RANGE_DAYS) {
			warningCount += 1;
			problems.push(
				`    ${chalk.yellow(`${spanDays}d span`)} ${event.slug}: ${event.date} (likely a year typo?)`
			);
		}
	}

	if (problems.length === 0) {
		console.log(tag, chalk.green(`✓ Event dates: all ${events.length} parse and look plausible`));
	} else {
		console.log(tag, chalk.red(`✗ Event dates: ${problems.length} issue(s)`));
		for (const line of problems) console.log(line);
	}
}

console.log(tag, 'Starting checks...');
await checkSlugs();
await checkEventDates();

console.log(tag, `Done. ${chalk.red(`${errorCount} error(s)`)}, ${chalk.yellow(`${warningCount} warning(s)`)}.`);
if (errorCount > 0) {
	process.exit(1);
}
