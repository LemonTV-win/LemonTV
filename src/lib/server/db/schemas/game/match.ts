import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, check, primaryKey } from 'drizzle-orm/sqlite-core';
import { team } from './team';
import { map } from './game';
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
