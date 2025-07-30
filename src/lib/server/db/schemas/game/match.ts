import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, check, primaryKey } from 'drizzle-orm/sqlite-core';
import { team } from './team';
import { map } from './game';
import type { GameMap } from '$lib/data/game';

export const match = sqliteTable(
	'match',
	{
		id: text('id').primaryKey(),
		format: text('format'),
		stageId: integer('stage_id')
	},
	(t) => [check('format', sql`${t.format} IN ('BO1', 'BO3', 'BO5')`)]
);

export const matchTeam = sqliteTable(
	'match_team',
	{
		matchId: text('match_id').references(() => match.id),
		teamId: text('team_id').references(() => team.id),
		position: integer('position'),
		score: integer('score').default(0)
	},
	(t) => [
		primaryKey({ columns: [t.matchId, t.teamId] }),
		check('position', sql`${t.position} >= 0`)
	]
);

// Map veto info
export const matchMap = sqliteTable('match_map', {
	id: integer('id').primaryKey(),
	matchId: text('match_id')
		.references(() => match.id)
		.notNull(),
	mapId: text('map_id')
		.references(() => map.id)
		.notNull(),
	order: integer('order'), // Ban/Pick order 0 = First Map, 1 = Second Map, 2 = Third Map
	side: integer('side'), // Starting side: 0 = Attack, 1 = Defense for demolition
	action: text('action', { enum: ['ban', 'pick', 'decider', 'set'] }), // Ban/Pick/Swap
	map_picker_position: integer('map_picker_position'),
	side_picker_position: integer('side_picker_position')
});

export const game = sqliteTable('game', {
	id: integer('id').primaryKey(),
	matchId: text('match_id')
		.references(() => match.id)
		.notNull(),
	mapId: text('map_id')
		.$type<GameMap>()
		.references(() => map.id)
		.notNull(),
	duration: integer('duration').notNull(),
	winner: integer('winner').notNull()
});

export const gameTeam = sqliteTable(
	'game_team',
	{
		gameId: integer('game_id')
			.references(() => game.id)
			.notNull(),
		teamId: text('team_id')
			.references(() => team.id)
			.notNull(),
		position: integer('position').notNull(), // 0 for team A, 1 for team B
		score: integer('score').notNull()
	},
	(t) => [
		primaryKey({ columns: [t.gameId, t.teamId] }),
		check('position', sql`${t.position} IN (0, 1)`)
	]
);

export const gamePlayerScore = sqliteTable('game_player_score', {
	id: integer('id').primaryKey(),
	gameId: integer('game_id')
		.references(() => game.id)
		.notNull(),
	teamId: text('team_id')
		.references(() => team.id)
		.notNull(),
	accountId: integer('account_id').notNull(),
	player: text('player').notNull(),
	characterFirstHalf: text('character_first_half'),
	characterSecondHalf: text('character_second_half'),
	score: integer('score').notNull(),
	damageScore: integer('damage_score').notNull(),
	kills: integer('kills').notNull(),
	knocks: integer('knocks').notNull(),
	deaths: integer('deaths').notNull(),
	assists: integer('assists').notNull(),
	damage: integer('damage').notNull()
});

export type Match = typeof match.$inferSelect;
export type MatchTeam = typeof matchTeam.$inferSelect;
export type MatchMap = typeof matchMap.$inferSelect;
export type Game = typeof game.$inferSelect;
export type GameTeam = typeof gameTeam.$inferSelect;
export type GamePlayerScore = typeof gamePlayerScore.$inferSelect;
