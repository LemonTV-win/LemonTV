import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, primaryKey, index } from 'drizzle-orm/sqlite-core';

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

export const communityTag = sqliteTable(
	'community_tag',
	{
		id: text('id').primaryKey(),
		name: text('name').notNull(),
		category: text('category').notNull(), // e.g., 'language', 'type', 'status'
		value: text('value').notNull(), // e.g., 'ja', 'Discord', 'active'
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.notNull()
			.default(sql`(unixepoch() * 1000)`),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.notNull()
			.default(sql`(unixepoch() * 1000)`)
	},
	(t) => [
		index('idx_ct_category').on(t.category),
		index('idx_ct_category_value').on(t.category, t.value)
	]
);

export const discordServerTag = sqliteTable(
	'discord_server_tag',
	{
		serverId: text('server_id')
			.references(() => discordServer.id)
			.notNull(),
		tagId: text('tag_id')
			.references(() => communityTag.id)
			.notNull(),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.notNull()
			.default(sql`(unixepoch() * 1000)`),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.notNull()
			.default(sql`(unixepoch() * 1000)`)
	},
	(t) => [
		primaryKey({ columns: [t.serverId, t.tagId] }),
		index('idx_dst_server').on(t.serverId),
		index('idx_dst_tag').on(t.tagId)
	]
);

export type DiscordServer = typeof discordServer.$inferSelect;
export type CommunityTag = typeof communityTag.$inferSelect;
export type DiscordServerTag = typeof discordServerTag.$inferSelect;
