import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, primaryKey, check } from 'drizzle-orm/sqlite-core';
import { user } from '../auth';

export const organizer = sqliteTable(
	'organizer',
	{
		id: text('id').primaryKey(),
		slug: text('slug').notNull().unique(),
		name: text('name').notNull(),
		logo: text('logo').notNull(),
		description: text('description'),
		url: text('url'),
		/**
		 * @description The type of organizer.
		 * | Type                  | Key Characteristic                | Typical Scale         | Organizational Complexity |
		 * | --------------------- | --------------------------------- | --------------------- | ------------------------- |
		 * | **Individual**        | One person running everything     | Very small/local      | Very low                  |
		 * | **Organization**      | Formal entity with staff & budget | Regional up to global | High                      |
		 * | **Community**         | Volunteer-driven group            | Local to national     | Medium                    |
		 * | **Tournament Series** | Multiple linked events            | Variable per stop     | Medium–High               |
		 * | **League**            | Season-long, scheduled matches    | Varies; often large   | Very high                 |
		 */
		type: text('type'),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.notNull()
			.default(sql`(unixepoch() * 1000)`),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.notNull()
			.default(sql`(unixepoch() * 1000)`)
	},
	(t) => [
		check(
			'type',
			sql`${t.type} IS NULL OR ${t.type} IN ('individual', 'organization', 'community', 'tournament_series', 'league')`
		)
	]
);

export const organizerUser = sqliteTable(
	'organizer_user',
	{
		organizerId: text('organizer_id')
			.references(() => organizer.id)
			.notNull(),
		userId: text('user_id')
			.references(() => user.id)
			.notNull(),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.notNull()
			.default(sql`(unixepoch() * 1000)`),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.notNull()
			.default(sql`(unixepoch() * 1000)`)
	},
	(t) => [primaryKey({ columns: [t.organizerId, t.userId] })]
);

export type Organizer = typeof organizer.$inferSelect;
export type OrganizerUser = typeof organizerUser.$inferSelect;
