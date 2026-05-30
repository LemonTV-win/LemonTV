import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { user } from './user';

/**
 * Personal Access Token for the authorized MCP server.
 *
 * Each token belongs to exactly one user and is the credential an authorized
 * editor presents from their AI client (Claude, etc.) to read/write LemonTV
 * data via MCP. Only the SHA-256 hash of the token is stored; the plaintext is
 * shown once at creation. `scope` is intentionally coarse ('read' | 'write')
 * because the app has exactly two roles and all data writes are gated by
 * ['admin','editor']; user/role management is never exposed over MCP.
 *
 * Revocation is a soft delete (`revokedAt`); validation also rejects expired
 * tokens. A 'write' token additionally resolves to read-only at request time
 * if the owner no longer holds editor/admin, so de-authorizing an editor
 * instantly defangs their tokens without per-token cleanup.
 */
export const mcpToken = sqliteTable(
	'mcp_token',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id),
		name: text('name').notNull(),
		// SHA-256 hex of the plaintext token; unique so lookups are by hash.
		tokenHash: text('token_hash').notNull().unique(),
		// Non-secret display prefix (e.g. "lemon_pat_AbC123") to identify a token
		// in the UI without revealing the secret.
		prefix: text('prefix').notNull(),
		scope: text('scope', { enum: ['read', 'write'] })
			.notNull()
			.default('read'),
		createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
		// Null = never expires.
		expiresAt: integer('expires_at', { mode: 'timestamp' }),
		lastUsedAt: integer('last_used_at', { mode: 'timestamp' }),
		// Null = active; set = revoked.
		revokedAt: integer('revoked_at', { mode: 'timestamp' })
	},
	(table) => {
		return {
			idx_user: index('idx_mcp_token_user').on(table.userId)
		};
	}
);

export type McpToken = typeof mcpToken.$inferSelect;
export type NewMcpToken = typeof mcpToken.$inferInsert;

export const mcpTokenRelations = relations(mcpToken, ({ one }) => ({
	user: one(user, {
		fields: [mcpToken.userId],
		references: [user.id]
	})
}));
