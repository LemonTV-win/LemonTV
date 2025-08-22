import { sqliteTable, text, integer, primaryKey, index } from 'drizzle-orm/sqlite-core';
import { player } from './player';

export const gameAccount = sqliteTable(
	'game_account',
	{
		server: text('server').notNull(), // 'Strinova' or 'CalabiYau'
		accountId: integer('account_id').notNull(),
		playerId: text('player_id')
			.notNull()
			.references(() => player.id),
		currentName: text('current_name').notNull(),
		region: text('region')
	},
	(table) => [
		primaryKey({ columns: [table.server, table.accountId] }),
		index('idx_ga_player').on(table.playerId)
	]
);

export type GameAccount = typeof gameAccount.$inferSelect;
