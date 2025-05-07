import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
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
	(table) => {
		return {
			pk: primaryKey({ columns: [table.server, table.accountId] })
		};
	}
);

export type GameAccount = typeof gameAccount.$inferSelect;
