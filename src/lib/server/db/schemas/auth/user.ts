import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { player } from '../game/player';

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

// User relations
export const userRelations = relations(user, ({ many }) => ({
	players: many(player),
	roles: many(userRole)
}));

// Role relations
export const roleRelations = relations(role, ({ many }) => ({
	userRoles: many(userRole)
}));

// UserRole relations
export const userRoleRelations = relations(userRole, ({ one }) => ({
	user: one(user, {
		fields: [userRole.userId],
		references: [user.id]
	}),
	role: one(role, {
		fields: [userRole.roleId],
		references: [role.id]
	})
}));
