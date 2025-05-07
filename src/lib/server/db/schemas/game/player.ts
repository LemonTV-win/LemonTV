import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { user } from '../auth/user';

export const player = sqliteTable('player', {
	id: text('id').primaryKey(),
	slug: text('slug').notNull().unique(),
	name: text('name').notNull(),
	nationality: text('nationality'),
	userId: text('user_id').references(() => user.id)
});

export const playerAlias = sqliteTable('player_alias', {
	playerId: text('player_id')
		.notNull()
		.references(() => player.id),
	alias: text('alias').notNull()
});

export type Player = typeof player.$inferSelect;
export type PlayerAlias = typeof playerAlias.$inferSelect;
