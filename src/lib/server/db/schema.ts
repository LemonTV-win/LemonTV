import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export const role = sqliteTable('role', {
	id: text('id').primaryKey(),
	name: text('name').notNull()
});

export const userRole = sqliteTable(
	'user_role',
	{
		userId: text('user_id')
			.notNull()
			.references(() => user.id),
		roleId: text('role_id')
			.notNull()
			.references(() => role.id)
	},
	(table) => {
		return {
			pk: primaryKey({ columns: [table.userId, table.roleId] })
		};
	}
);

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;
