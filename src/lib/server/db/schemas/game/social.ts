import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { player } from './player';

export const social_platform = sqliteTable('social_platform', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	url_template: text('url_template')
});

export const player_social_account = sqliteTable('social_account', {
	id: text('id').primaryKey(),
	platformId: text('platform_id')
		.notNull()
		.references(() => social_platform.id),
	playerId: text('player_id')
		.notNull()
		.references(() => player.id),
	accountId: text('account_id').notNull(),
	overriding_url: text('overriding_url')
});
