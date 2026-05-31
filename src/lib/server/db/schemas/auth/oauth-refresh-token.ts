import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { user } from './user';
import { oauthClient } from './oauth-client';

/**
 * OAuth refresh tokens for the MCP flow. Single-use and ROTATED: every refresh
 * exchange consumes the presented token (`consumedAt` set under a
 * `WHERE consumedAt IS NULL` guard) and issues a fresh one. Only the SHA-256
 * hash of the opaque token is stored. Bound to client + user + granted scope +
 * resource so a refresh can never widen scope or change audience.
 */
export const oauthRefreshToken = sqliteTable(
	'oauth_refresh_token',
	{
		id: text('id').primaryKey(),
		tokenHash: text('token_hash').notNull().unique(),
		clientId: text('client_id')
			.notNull()
			.references(() => oauthClient.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => user.id),
		scope: text('scope').notNull(),
		resource: text('resource').notNull(),
		expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
		consumedAt: integer('consumed_at', { mode: 'timestamp' }),
		createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
	},
	(table) => {
		return {
			idx_client: index('idx_oauth_refresh_client').on(table.clientId),
			idx_user: index('idx_oauth_refresh_user').on(table.userId),
			idx_expires: index('idx_oauth_refresh_expires').on(table.expiresAt)
		};
	}
);

export type OAuthRefreshToken = typeof oauthRefreshToken.$inferSelect;
export type NewOAuthRefreshToken = typeof oauthRefreshToken.$inferInsert;
