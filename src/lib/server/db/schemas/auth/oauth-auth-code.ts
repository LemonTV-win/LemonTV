import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { user } from './user';
import { oauthClient } from './oauth-client';

/**
 * OAuth authorization codes (RFC 6749 + PKCE). Single-use, short-TTL, and bound
 * to the client + exact redirect_uri + PKCE challenge + user + resource. Only
 * the SHA-256 hash of the opaque code is stored; redemption is atomic
 * (`consumedAt` set under a `WHERE consumedAt IS NULL` guard) so concurrent
 * token requests can't double-spend a code.
 */
export const oauthAuthCode = sqliteTable(
	'oauth_auth_code',
	{
		id: text('id').primaryKey(),
		tokenHash: text('code_hash').notNull().unique(),
		clientId: text('client_id')
			.notNull()
			.references(() => oauthClient.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => user.id),
		redirectUri: text('redirect_uri').notNull(),
		codeChallenge: text('code_challenge').notNull(),
		codeChallengeMethod: text('code_challenge_method').notNull().default('S256'),
		scope: text('scope').notNull(), // granted scope (post-consent)
		resource: text('resource').notNull(), // RFC 8707 — copied into the token aud
		expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
		consumedAt: integer('consumed_at', { mode: 'timestamp' }),
		createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
	},
	(table) => {
		return {
			idx_client: index('idx_oauth_code_client').on(table.clientId),
			idx_expires: index('idx_oauth_code_expires').on(table.expiresAt)
		};
	}
);

export type OAuthAuthCode = typeof oauthAuthCode.$inferSelect;
export type NewOAuthAuthCode = typeof oauthAuthCode.$inferInsert;
