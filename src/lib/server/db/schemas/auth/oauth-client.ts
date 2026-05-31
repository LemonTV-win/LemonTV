import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

/**
 * Dynamically-registered (RFC 7591) OAuth clients for the MCP authorization
 * flow. MCP clients are public (PKCE) — `token_endpoint_auth_method` is 'none'
 * and there is no client secret. `redirect_uris` is a JSON array compared by
 * EXACT string match at /authorize and /token.
 */
export const oauthClient = sqliteTable(
	'oauth_client',
	{
		id: text('id').primaryKey(), // client_id (opaque random)
		clientName: text('client_name'),
		redirectUris: text('redirect_uris').notNull(), // JSON array of exact absolute URIs
		grantTypes: text('grant_types').notNull().default('["authorization_code"]'),
		responseTypes: text('response_types').notNull().default('["code"]'),
		tokenEndpointAuthMethod: text('token_endpoint_auth_method').notNull().default('none'),
		scope: text('scope'), // space-delimited allowed scopes
		clientUri: text('client_uri'),
		logoUri: text('logo_uri'),
		softwareId: text('software_id'),
		createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
	},
	(table) => {
		return { idx_created: index('idx_oauth_client_created').on(table.createdAt) };
	}
);

export type OAuthClient = typeof oauthClient.$inferSelect;
export type NewOAuthClient = typeof oauthClient.$inferInsert;
