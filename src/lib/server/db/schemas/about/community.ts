import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const discordServer = sqliteTable('discord_server', {
	id: text('id').primaryKey(),
	title: text('title').notNull(),
	url: text('url').notNull(),
	icon: text('icon').notNull(),
	description: text('description').notNull(),
	additionalLinkText: text('additional_link_text'),
	additionalLinkUrl: text('additional_link_url'),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.notNull()
		.default(sql`(unixepoch() * 1000)`),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.notNull()
		.default(sql`(unixepoch() * 1000)`)
});

export type DiscordServer = typeof discordServer.$inferSelect;
