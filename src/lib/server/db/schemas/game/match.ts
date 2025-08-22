import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, check, primaryKey, index } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { team } from './team';
import { map } from './game';
import type { GameMap } from '$lib/data/game';
import { player } from './player';
import type { TLanguageCode } from 'countries-list';
import { stage } from './stage';
import { playerStats } from './player-stats';

// #region Match
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

export type Match = typeof match.$inferSelect;
export type MatchTeam = typeof matchTeam.$inferSelect;
export type MatchMap = typeof matchMap.$inferSelect;
// #endregion

// #region Game

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
		check('position', sql`${t.position} IN (0, 1)`),
		index('idx_gt_game').on(t.gameId),
		index('idx_gt_team').on(t.teamId)
	]
);

export const gamePlayerScore = sqliteTable(
	'game_player_score',
	{
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
	},
	(t) => [
		index('idx_gps_game').on(t.gameId),
		index('idx_gps_team').on(t.teamId),
		index('idx_gps_account').on(t.accountId),
		index('idx_gps_char1').on(t.characterFirstHalf),
		index('idx_gps_char2').on(t.characterSecondHalf)
	]
);

export const gameVod = sqliteTable(
	'game_vod',
	{
		gameId: integer('game_id')
			.references(() => game.id)
			.notNull(),
		url: text('url').notNull(),
		type: text('type', {
			enum: [
				'main', // Main casted stream (Official TO=Tournament Organizer broadcast with commentary)
				'sub', // Other official stream w/o casters or alternate cam / clean feed / map cam, etc.
				'restream', // Non-offcial restream of main w/ custom casting, e.g. in other languages or reaction
				'pov', // Live or recorded player POV by player or TO or third party, either full or cut
				'archive', // Non-official unmodified or full game replay record for archive purposes
				'clip', // Highlight/lowlight cut clip of edited videos showing only kills or final moments
				'analysis' // Post-match analysis of a specific moment in the game or strategy reviews
			]
		}).notNull(),
		playerId: text('player_id').references(() => player.id), // for POV VODs
		teamId: text('team_id').references(() => team.id), // for POV or team specific contents
		language: text('language').$type<TLanguageCode>(), // main language of the VOD
		platform: text('platform').$type<'youtube' | 'bilibili' | 'twitch'>(),
		title: text('title'),
		official: integer('official', { mode: 'boolean' }).notNull().default(true),
		startTime: integer('start_time'), // in seconds
		available: integer('available', { mode: 'boolean' }).notNull().default(true),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.notNull()
			.default(sql`(unixepoch() * 1000)`),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.notNull()
			.default(sql`(unixepoch() * 1000)`)
	},
	(t) => [primaryKey({ columns: [t.gameId, t.url] })]
);

export type Game = typeof game.$inferSelect;
export type GameTeam = typeof gameTeam.$inferSelect;
export type GamePlayerScore = typeof gamePlayerScore.$inferSelect;
export type GameVod = typeof gameVod.$inferSelect;
// #endregion

// #region Relations
export const matchRelations = relations(match, ({ one, many }) => ({
	stage: one(stage, {
		fields: [match.stageId],
		references: [stage.id]
	}),
	matchTeams: many(matchTeam),
	matchMaps: many(matchMap),
	games: many(game)
}));

export const matchTeamRelations = relations(matchTeam, ({ one }) => ({
	match: one(match, {
		fields: [matchTeam.matchId],
		references: [match.id]
	}),
	team: one(team, {
		fields: [matchTeam.teamId],
		references: [team.id]
	})
}));

export const matchMapRelations = relations(matchMap, ({ one }) => ({
	match: one(match, {
		fields: [matchMap.matchId],
		references: [match.id]
	}),
	map: one(map, {
		fields: [matchMap.mapId],
		references: [map.id]
	})
}));

export const gameRelations = relations(game, ({ one, many }) => ({
	match: one(match, {
		fields: [game.matchId],
		references: [match.id]
	}),
	map: one(map, {
		fields: [game.mapId],
		references: [map.id]
	}),
	gameTeams: many(gameTeam),
	gamePlayerScores: many(gamePlayerScore),
	gameVods: many(gameVod)
}));

export const gameTeamRelations = relations(gameTeam, ({ one }) => ({
	game: one(game, {
		fields: [gameTeam.gameId],
		references: [game.id]
	}),
	team: one(team, {
		fields: [gameTeam.teamId],
		references: [team.id]
	})
}));

export const gamePlayerScoreRelations = relations(gamePlayerScore, ({ one }) => ({
	game: one(game, {
		fields: [gamePlayerScore.gameId],
		references: [game.id]
	}),
	team: one(team, {
		fields: [gamePlayerScore.teamId],
		references: [team.id]
	}),
	playerStats: one(playerStats, {
		relationName: 'playerStatsGameScores',
		fields: [gamePlayerScore.accountId],
		references: [playerStats.playerId]
	})
}));

export const gameVodRelations = relations(gameVod, ({ one }) => ({
	game: one(game, {
		fields: [gameVod.gameId],
		references: [game.id]
	}),
	player: one(player, {
		fields: [gameVod.playerId],
		references: [player.id]
	}),
	team: one(team, {
		fields: [gameVod.teamId],
		references: [team.id]
	})
}));
// #endregion
