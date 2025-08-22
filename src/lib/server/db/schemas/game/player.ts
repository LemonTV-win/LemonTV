import { primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { user } from '../auth/user';
import { relations } from 'drizzle-orm';
import { gameAccount } from './game-account';
import { player_social_account } from './social';
import { teamPlayer } from './team';
import { playerCharacterStats, playerStats } from './player-stats';

export const player = sqliteTable('player', {
	id: text('id').primaryKey(),
	slug: text('slug').notNull().unique(),
	name: text('name').notNull(),
	nationality: text('nationality'),
	avatar: text('avatar'),
	userId: text('user_id').references(() => user.id)
});

export const playerAlias = sqliteTable('player_alias', {
	playerId: text('player_id')
		.notNull()
		.references(() => player.id),
	alias: text('alias').notNull()
});

export const playerAdditionalNationality = sqliteTable(
	'player_additional_nationality',
	{
		playerId: text('player_id')
			.notNull()
			.references(() => player.id),
		nationality: text('nationality').notNull()
	},
	(t) => [primaryKey({ columns: [t.playerId, t.nationality] })]
);

export type Player = typeof player.$inferSelect;
export type PlayerAlias = typeof playerAlias.$inferSelect;
export type PlayerAdditionalNationality = typeof playerAdditionalNationality.$inferSelect;

export const playerRelations = relations(player, ({ many, one }) => ({
	gameAccounts: many(gameAccount),
	aliases: many(playerAlias),
	additionalNationalities: many(playerAdditionalNationality),
	socialAccounts: many(player_social_account),
	teamMemberships: many(teamPlayer),
	stats: one(playerStats, {
		fields: [player.id],
		references: [playerStats.playerId]
	}),
	characterStats: many(playerCharacterStats),
	user: one(user, {
		fields: [player.userId],
		references: [user.id]
	})
}));

export const gameAccountRelations = relations(gameAccount, ({ one }) => ({
	player: one(player, {
		fields: [gameAccount.playerId],
		references: [player.id]
	})
}));

export const playerAliasRelations = relations(playerAlias, ({ one }) => ({
	player: one(player, {
		fields: [playerAlias.playerId],
		references: [player.id]
	})
}));

export const playerAdditionalNationalityRelations = relations(
	playerAdditionalNationality,
	({ one }) => ({
		player: one(player, {
			fields: [playerAdditionalNationality.playerId],
			references: [player.id]
		})
	})
);
