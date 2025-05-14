import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, check } from 'drizzle-orm/sqlite-core';

export const match = sqliteTable(
	'match',
	{
		id: text('id').primaryKey(),
		format: text('format'),
		stageId: integer('stage_id')
	},
	(t) => [check('format', sql`${t.format} IN ('BO1', 'BO3', 'BO5')`)]
);
