import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	email: text('email').notNull().unique(),
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

export type User = typeof user.$inferSelect;
export type Role = typeof role.$inferSelect;
export type UserRole = typeof userRole.$inferSelect;
