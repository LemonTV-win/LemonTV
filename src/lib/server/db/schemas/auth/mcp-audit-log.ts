import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { user } from './user';
import { mcpToken } from './mcp-token';

/**
 * Audit trail for the authorized MCP server.
 *
 * `edit_history` already records successful data mutations; this captures what
 * it can't — every MCP tool call's outcome including reads, permission denials,
 * rate-limit rejections, and errors — keyed by the token and its owner, so
 * AI-driven access can be moderated and abuse traced to a revocable token.
 */
export const mcpAuditLog = sqliteTable(
	'mcp_audit_log',
	{
		id: text('id').primaryKey(),
		tokenId: text('token_id')
			.notNull()
			.references(() => mcpToken.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => user.id),
		tool: text('tool').notNull(),
		status: text('status', { enum: ['success', 'denied', 'error', 'rate_limited'] }).notNull(),
		detail: text('detail'),
		ip: text('ip'),
		createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
	},
	(table) => {
		return {
			idx_token: index('idx_mcp_audit_token').on(table.tokenId),
			idx_created: index('idx_mcp_audit_created').on(table.createdAt)
		};
	}
);

export type McpAuditLog = typeof mcpAuditLog.$inferSelect;
export type NewMcpAuditLog = typeof mcpAuditLog.$inferInsert;

export const mcpAuditLogRelations = relations(mcpAuditLog, ({ one }) => ({
	token: one(mcpToken, {
		fields: [mcpAuditLog.tokenId],
		references: [mcpToken.id]
	}),
	user: one(user, {
		fields: [mcpAuditLog.userId],
		references: [user.id]
	})
}));
