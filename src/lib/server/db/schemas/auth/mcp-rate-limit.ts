import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

/**
 * Per-subject rate-limit state (token-bucket) for the MCP/OAuth surface.
 *
 * One row per `subject` — a PAT (`mcp_token.id`), an OAuth token (`oauth:<jti>`),
 * or a registration client IP (`ip:register:<addr>`). `tokens` is the current
 * available request allowance; it refills over time up to a capacity. Persisted
 * (not in-memory) so the limit holds across serverless instances. No foreign key
 * (the subject is not always a token). See `src/lib/server/mcp/rate-limit.ts`.
 */
export const mcpRateLimit = sqliteTable('mcp_rate_limit', {
	subject: text('token_id').primaryKey(),
	tokens: real('tokens').notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull()
});

export type McpRateLimit = typeof mcpRateLimit.$inferSelect;
export type NewMcpRateLimit = typeof mcpRateLimit.$inferInsert;
