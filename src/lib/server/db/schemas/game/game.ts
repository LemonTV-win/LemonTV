import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const map = sqliteTable('map', {
	id: text('id').primaryKey()
});
