import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, primaryKey, check } from 'drizzle-orm/sqlite-core';
import { event } from './event';

export const stage = sqliteTable(
	'event_stage',
	{
		id: integer('id').primaryKey(),
		eventId: text('event_id')
			.references(() => event.id)
			.notNull(),
		title: text('title').notNull(),
		stage: text('stage').notNull(),
		format: text('format').notNull(),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.notNull()
			.default(sql`(unixepoch() * 1000)`),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.notNull()
			.default(sql`(unixepoch() * 1000)`)
	},
	(t) => [
		check('stage', sql`${t.stage} IN ('group', 'qualifier', 'showmatch', 'playoff')`),
		check('format', sql`${t.format} IN ('single', 'double', 'swiss', 'round-robin')`)
	]
);
