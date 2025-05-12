import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const event = sqliteTable('event', {
	id: text('id').primaryKey(),
	slug: text('slug').notNull().unique(),
	name: text('name').notNull(),
	official: integer('official', { mode: 'boolean' }).notNull(),
	server: text('server').notNull(),
	format: text('format').notNull(),
	region: text('region').notNull(),
	image: text('image').notNull(),
	status: text('status').notNull(),
	capacity: integer('capacity').notNull(),
	date: text('date').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.notNull()
		.default(sql`(unixepoch() * 1000)`),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.notNull()
		.default(sql`(unixepoch() * 1000)`)
});

export type Event = typeof event.$inferSelect;
