import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, check, primaryKey } from 'drizzle-orm/sqlite-core';
import { teams } from './team';
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
		teamId: text('team_id').references(() => teams.id),
		position: integer('position'),
		score: integer('score').default(0)
	},
	(t) => [
		primaryKey({ columns: [t.matchId, t.teamId] }),
		check('position', sql`${t.position} >= 0`)
	]
);

export type Match = typeof match.$inferSelect;
export type MatchTeam = typeof matchTeam.$inferSelect;
