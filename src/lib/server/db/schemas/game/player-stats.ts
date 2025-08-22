import { sqliteTable, text, integer, real, primaryKey, index } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
import { player } from './player';
import { character } from './game';

const UPDATE_REASONS = [
	'periodic', // hourly, daily, weekly, monthly, etc.
	'manual', // manually triggered by an admin
	'triggered', // triggered by an event (after game update, etc.)
	'deploy' // triggered by a deployment of the site
] as const;

export const playerStats = sqliteTable('player_stats', {
	playerId: text('player_id')
		.primaryKey()
		.references(() => player.id, { onDelete: 'cascade', onUpdate: 'cascade' }),

	// Game statistics
	totalGames: integer('total_games').notNull().default(0),
	totalWins: integer('total_wins').notNull().default(0),
	totalLosses: integer('total_losses').notNull().default(0),

	// Combat statistics
	totalKills: integer('total_kills').notNull().default(0),
	totalDeaths: integer('total_deaths').notNull().default(0),
	totalAssists: integer('total_assists').notNull().default(0),
	totalKnocks: integer('total_knocks').notNull().default(0),

	// Score statistics
	totalScore: integer('total_score').notNull().default(0),
	totalDamage: integer('total_damage').notNull().default(0),

	// Calculated statistics
	winRate: real('win_rate').notNull().default(0),
	kd: real('kd').notNull().default(0),
	averageScore: real('average_score').notNull().default(0),
	averageDamage: real('average_damage').notNull().default(0),
	playerRating: real('player_rating').notNull().default(0),

	// Event participation
	eventsCount: integer('events_count').notNull().default(0),

	// Timestamps for tracking when stats were last updated
	lastGameAt: integer('last_game_at', { mode: 'timestamp_ms' }),
	lastEventAt: integer('last_event_at', { mode: 'timestamp_ms' }),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.notNull()
		.default(sql`(unixepoch() * 1000)`),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.notNull()
		.default(sql`(unixepoch() * 1000)`)
});

// New table for character-specific player stats
export const playerCharacterStats = sqliteTable(
	'player_character_stats',
	{
		playerId: text('player_id')
			.notNull()
			.references(() => player.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
		characterId: text('character_id')
			.notNull()
			.references(() => character.id), // Character name/enum
		// Character-specific game statistics
		totalGames: integer('total_games').notNull().default(0),
		totalWins: integer('total_wins').notNull().default(0),
		totalLosses: integer('total_losses').notNull().default(0),

		// Character-specific combat statistics
		totalKills: integer('total_kills').notNull().default(0),
		totalDeaths: integer('total_deaths').notNull().default(0),
		totalAssists: integer('total_assists').notNull().default(0),
		totalKnocks: integer('total_knocks').notNull().default(0),

		// Character-specific score statistics
		totalScore: integer('total_score').notNull().default(0),
		totalDamage: integer('total_damage').notNull().default(0),

		// Character-specific calculated statistics
		winRate: real('win_rate').notNull().default(0),
		kd: real('kd').notNull().default(0),
		averageScore: real('average_score').notNull().default(0),
		averageDamage: real('average_damage').notNull().default(0),
		superstringPower: real('superstring_power').notNull().default(0),

		// Timestamps
		lastGameAt: integer('last_game_at', { mode: 'timestamp_ms' }),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.notNull()
			.default(sql`(unixepoch() * 1000)`),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.notNull()
			.default(sql`(unixepoch() * 1000)`)
	},
	(table) => [
		primaryKey({ columns: [table.playerId, table.characterId] }),
		index('idx_pcs_player').on(table.playerId),
		index('idx_pcs_character').on(table.characterId)
	]
);

export const playerStatsHistory = sqliteTable('player_stats_history', {
	id: text('id').primaryKey(),
	playerId: text('player_id')
		.notNull()
		.references(() => player.id, { onDelete: 'cascade', onUpdate: 'cascade' }),

	// Snapshot of stats at a point in time
	totalGames: integer('total_games').notNull(),
	totalWins: integer('total_wins').notNull(),
	totalLosses: integer('total_losses').notNull(),
	totalKills: integer('total_kills').notNull(),
	totalDeaths: integer('total_deaths').notNull(),
	totalAssists: integer('total_assists').notNull(),
	totalKnocks: integer('total_knocks').notNull(),
	totalScore: integer('total_score').notNull(),
	totalDamage: integer('total_damage').notNull(),
	winRate: real('win_rate').notNull(),
	kd: real('kd').notNull(),
	averageScore: real('average_score').notNull(),
	averageDamage: real('average_damage').notNull(),
	playerRating: real('player_rating').notNull(),
	eventsCount: integer('events_count').notNull(),

	// Metadata
	snapshotDate: integer('snapshot_date', { mode: 'timestamp_ms' }).notNull(),
	reason: text('reason', { enum: UPDATE_REASONS }).notNull(),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.notNull()
		.default(sql`(unixepoch() * 1000)`)
});

// Character stats history table
export const playerCharacterStatsHistory = sqliteTable('player_character_stats_history', {
	id: text('id').primaryKey(),
	playerId: text('player_id')
		.notNull()
		.references(() => player.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
	characterId: text('character_id')
		.notNull()
		.references(() => character.id), // Character name/enum

	// Snapshot of character-specific stats at a point in time
	totalGames: integer('total_games').notNull(),
	totalWins: integer('total_wins').notNull(),
	totalLosses: integer('total_losses').notNull(),
	totalKills: integer('total_kills').notNull(),
	totalDeaths: integer('total_deaths').notNull(),
	totalAssists: integer('total_assists').notNull(),
	totalKnocks: integer('total_knocks').notNull(),
	totalScore: integer('total_score').notNull(),
	totalDamage: integer('total_damage').notNull(),
	winRate: real('win_rate').notNull(),
	kd: real('kd').notNull(),
	averageScore: real('average_score').notNull(),
	averageDamage: real('average_damage').notNull(),
	superstringPower: real('superstring_power').notNull(),

	// Metadata
	snapshotDate: integer('snapshot_date', { mode: 'timestamp_ms' }).notNull(),
	reason: text('reason', { enum: UPDATE_REASONS }).notNull(),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.notNull()
		.default(sql`(unixepoch() * 1000)`)
});

export type PlayerStats = typeof playerStats.$inferSelect;
export type PlayerCharacterStats = typeof playerCharacterStats.$inferSelect;
export type PlayerStatsHistory = typeof playerStatsHistory.$inferSelect;
export type PlayerCharacterStatsHistory = typeof playerCharacterStatsHistory.$inferSelect;

export const playerStatsRelations = relations(playerStats, ({ one, many }) => ({
	player: one(player, {
		fields: [playerStats.playerId],
		references: [player.id]
	})
}));

export const playerCharacterStatsRelations = relations(playerCharacterStats, ({ one, many }) => ({
	player: one(player, {
		fields: [playerCharacterStats.playerId],
		references: [player.id]
	}),
	character: one(character, {
		fields: [playerCharacterStats.characterId],
		references: [character.id]
	})
}));

export const playerStatsHistoryRelations = relations(playerStatsHistory, ({ one }) => ({
	player: one(player, {
		fields: [playerStatsHistory.playerId],
		references: [player.id]
	})
}));

export const playerCharacterStatsHistoryRelations = relations(
	playerCharacterStatsHistory,
	({ one }) => ({
		player: one(player, {
			fields: [playerCharacterStatsHistory.playerId],
			references: [player.id]
		}),
		character: one(character, {
			fields: [playerCharacterStatsHistory.characterId],
			references: [character.id]
		})
	})
);
