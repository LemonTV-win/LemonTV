import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { user } from './auth/user';

export const editHistory = sqliteTable('edit_history', {
	id: text('id').primaryKey(),
	tableName: text('table_name').notNull(),
	recordId: text('record_id').notNull(),
	fieldName: text('field_name').notNull(),
	oldValue: text('old_value'),
	newValue: text('new_value'),
	editedBy: text('edited_by')
		.references(() => user.id)
		.notNull(),
	editedAt: integer('edited_at', { mode: 'timestamp' }).notNull().defaultNow()
});

export type EditHistory = typeof editHistory.$inferSelect;
