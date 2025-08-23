import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { user } from './user';

export const session = sqliteTable(
	'session',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id),
		expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
	},
	(t) => [index('idx_session_user').on(t.userId)]
);

export type Session = typeof session.$inferSelect;
