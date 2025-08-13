import { sql } from 'drizzle-orm';
import { text, sqliteTable, unique, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { player } from './player';

export const team = sqliteTable('teams', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	slug: text('slug').notNull(),
	abbr: text('abbr'),
	logo: text('logo'),
	region: text('region'),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

export const teamPlayer = sqliteTable('team_player', {
	id: integer('id').primaryKey(),
	teamId: text('team_id')
		.notNull()
		.references(() => team.id),
	playerId: text('player_id').notNull(),
	role: text('role').notNull(), // 'active' | 'substitute' | 'former' | 'coach' | 'manager' | 'owner'
	startedOn: text('started_on'), // format: YYYY-MM-DD
	endedOn: text('ended_on'), // format: YYYY-MM-DD
	note: text('note')
});

export const teamAlias = sqliteTable(
	'team_alias',
	{
		id: integer('id').primaryKey(),
		teamId: text('team_id')
			.notNull()
			.references(() => team.id),
		alias: text('alias').notNull()
	},
	(t) => [unique().on(t.teamId, t.alias)]
);

export type Team = typeof team.$inferSelect;
export type TeamPlayer = typeof teamPlayer.$inferSelect;
export type TeamAlias = typeof teamAlias.$inferSelect;

// Team relations
export const teamRelations = relations(team, ({ many }) => ({
	players: many(teamPlayer),
	aliases: many(teamAlias)
}));

// TeamPlayer relations
export const teamPlayerRelations = relations(teamPlayer, ({ one }) => ({
	team: one(team, {
		fields: [teamPlayer.teamId],
		references: [team.id]
	}),
	player: one(player, {
		fields: [teamPlayer.playerId],
		references: [player.id]
	})
}));

// TeamAlias relations
export const teamAliasRelations = relations(teamAlias, ({ one }) => ({
	team: one(team, {
		fields: [teamAlias.teamId],
		references: [team.id]
	})
}));
