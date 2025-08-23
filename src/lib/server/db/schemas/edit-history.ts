import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { user } from './auth/user';
import { sql } from 'drizzle-orm';

export const editHistory = sqliteTable(
	'edit_history',
	{
		id: text('id').primaryKey(),
		tableName: text('table_name').notNull(),
		recordId: text('record_id').notNull(),
		fieldName: text('field_name').notNull(),
		oldValue: text('old_value'),
		newValue: text('new_value'),
		editedBy: text('edited_by')
			.references(() => user.id)
			.notNull(),
		editedAt: integer('edited_at', { mode: 'timestamp_ms' })
			.notNull()
			.default(sql`(unixepoch() * 1000)`)
	},
	(t) => [
		index('idx_eh_table').on(t.tableName),
		index('idx_eh_record').on(t.recordId),
		index('idx_eh_edited_by').on(t.editedBy),
		index('idx_eh_edited_at').on(t.editedAt),
		index('idx_eh_table_record').on(t.tableName, t.recordId),
		index('idx_eh_table_edited_at').on(t.tableName, t.editedAt)
	]
);

export type EditHistory = typeof editHistory.$inferSelect;
