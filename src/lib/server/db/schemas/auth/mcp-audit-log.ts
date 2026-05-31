import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { user } from './user';

/**
 * Audit trail for the authorized MCP server.
 *
 * `edit_history` already records successful data mutations; this captures what
 * it can't — every MCP tool call's outcome including reads, permission denials,
 * rate-limit rejections, and errors — keyed by the caller's subject and owner.
 *
 * `subject` is the generic credential identifier so BOTH auth paths are audited:
 * a PAT row stores the raw `mcp_token.id` (so the moderation view can still join
 * it to the token's name); an OAuth row stores `oauth:<jti>`. There is
 * deliberately NO foreign key — the audit trail must survive token revocation
 * (cascade-deleting it would erase the record of what a now-revoked token did).
 */
export const mcpAuditLog = sqliteTable(
	'mcp_audit_log',
	{
		id: text('id').primaryKey(),
		subject: text('token_id').notNull(),
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
			idx_subject: index('idx_mcp_audit_token').on(table.subject),
			idx_created: index('idx_mcp_audit_created').on(table.createdAt)
		};
	}
);

export type McpAuditLog = typeof mcpAuditLog.$inferSelect;
export type NewMcpAuditLog = typeof mcpAuditLog.$inferInsert;

export const mcpAuditLogRelations = relations(mcpAuditLog, ({ one }) => ({
	user: one(user, {
		fields: [mcpAuditLog.userId],
		references: [user.id]
	})
}));
