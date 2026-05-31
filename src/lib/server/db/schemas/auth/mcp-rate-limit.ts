import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { mcpToken } from './mcp-token';

/**
 * Per-token rate-limit state (token-bucket) for the MCP server.
 *
 * One row per MCP token. `tokens` is the current number of available requests;
 * it refills over time up to a capacity. Persisted (rather than in-memory) so
 * the limit holds across serverless instances. See `src/lib/server/mcp/rate-limit.ts`.
 */
export const mcpRateLimit = sqliteTable('mcp_rate_limit', {
	tokenId: text('token_id')
		.primaryKey()
		.references(() => mcpToken.id, { onDelete: 'cascade' }),
	tokens: real('tokens').notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull()
});

export type McpRateLimit = typeof mcpRateLimit.$inferSelect;
export type NewMcpRateLimit = typeof mcpRateLimit.$inferInsert;

export const mcpRateLimitRelations = relations(mcpRateLimit, ({ one }) => ({
	token: one(mcpToken, {
		fields: [mcpRateLimit.tokenId],
		references: [mcpToken.id]
	})
}));
