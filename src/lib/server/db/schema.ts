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

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export const player = sqliteTable('player', {
	id: text('id').primaryKey(),
	slug: text('slug').notNull().unique(),
	name: text('name').notNull(),
	nationality: text('nationality'),
	userId: text('user_id').references(() => user.id)
});

export const playerAlias = sqliteTable('player_alias', {
	playerId: text('player_id')
		.notNull()
		.references(() => player.id),
	alias: text('alias').notNull()
});

export const gameAccount = sqliteTable(
	'game_account',
	{
		server: text('server').notNull(), // 'Strinova' or 'CalabiYau'
		accountId: integer('account_id').notNull(),
		playerId: text('player_id')
			.notNull()
			.references(() => player.id),
		currentName: text('current_name').notNull(),
		region: text('region')
	},
	(table) => {
		return {
			pk: primaryKey({ columns: [table.server, table.accountId] })
		};
	}
);

export type User = typeof user.$inferSelect;
export type Role = typeof role.$inferSelect;
export type UserRole = typeof userRole.$inferSelect;

export type Session = typeof session.$inferSelect;

export type Player = typeof player.$inferSelect;

export type PlayerAlias = typeof playerAlias.$inferSelect;

export type GameAccount = typeof gameAccount.$inferSelect;
