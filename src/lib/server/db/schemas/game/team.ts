import { sql } from 'drizzle-orm';
import { text, sqliteTable, unique, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { player } from './player';
import { event } from './event';
import type { Locale } from '$lib/paraglide/runtime';

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

export const teamPlayer = sqliteTable(
	'team_player',
	{
		id: integer('id').primaryKey(),
		teamId: text('team_id')
			.notNull()
			.references(() => team.id),
		playerId: text('player_id').notNull(),
		role: text('role').notNull(), // 'active' | 'substitute' | 'former' | 'coach' | 'manager' | 'owner'
		startedOn: text('started_on'), // format: YYYY-MM-DD
		endedOn: text('ended_on'), // format: YYYY-MM-DD
		note: text('note')
	},
	(t) => [
		index('idx_tp_team').on(t.teamId),
		index('idx_tp_player').on(t.playerId),
		index('idx_tp_role').on(t.role)
	]
);

export const teamAlias = sqliteTable(
	'team_alias',
	{
		id: integer('id').primaryKey(),
		teamId: text('team_id')
			.notNull()
			.references(() => team.id),
		alias: text('alias').notNull()
	},
	(t) => [unique().on(t.teamId, t.alias), index('idx_ta_team').on(t.teamId)]
);

export const teamSlogan = sqliteTable(
	'team_slogan',
	{
		id: integer('id').primaryKey(),
		teamId: text('team_id')
			.notNull()
			.references(() => team.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
		eventId: text('event_id').references(() => event.id, {
			onDelete: 'set null',
			onUpdate: 'cascade'
		}),
		slogan: text('slogan').notNull(),
		language: text('language').$type<Locale>(),
		// Bookkeeping
		createdAt: text('created_at')
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: text('updated_at')
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull()
	},
	(t) => [
		// Fast lookups
		uniqueIndex('team_slogan_team_slogan_dupe_guard').on(t.teamId, t.eventId, t.slogan) // prevent exact
	]
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
