import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { user } from '../auth';

export const organizer = sqliteTable('organizer', {
	id: text('id').primaryKey(),
	slug: text('slug').notNull().unique(),
	name: text('name').notNull(),
	logo: text('logo').notNull(),
	description: text('description'),
	url: text('url'),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.notNull()
		.default(sql`(unixepoch() * 1000)`),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.notNull()
		.default(sql`(unixepoch() * 1000)`)
});

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
