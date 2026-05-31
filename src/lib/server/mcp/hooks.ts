/**
 * DB-backed implementations of the MCP dispatch hooks (audit + rate limit).
 *
 * The route composes these into an `McpHooks` object and passes it to
 * `handleMcpMessage`; `dispatch` calls them around each `tools/call`.
 */
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { consumeToken, DEFAULT_BUCKET, type BucketState } from './rate-limit';

/**
 * Consume one rate-limit token for `tokenId` (persisted token bucket). Runs in
 * a transaction so the read-modify-write is atomic per token.
 */
export async function consumeRateLimit(
	tokenId: string
): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
	const now = Date.now();
	try {
		return await db.transaction(async (tx) => {
			const [row] = await tx
				.select()
				.from(table.mcpRateLimit)
				.where(eq(table.mcpRateLimit.tokenId, tokenId));

			const state: BucketState = row
				? { tokens: row.tokens, updatedAtMs: row.updatedAt.getTime() }
				: { tokens: DEFAULT_BUCKET.capacity, updatedAtMs: now };

			const result = consumeToken(state, now, DEFAULT_BUCKET);

			if (row) {
				await tx
					.update(table.mcpRateLimit)
					.set({ tokens: result.tokens, updatedAt: new Date(now) })
					.where(eq(table.mcpRateLimit.tokenId, tokenId));
			} else {
				await tx
					.insert(table.mcpRateLimit)
					.values({ tokenId, tokens: result.tokens, updatedAt: new Date(now) });
			}

			return { allowed: result.allowed, retryAfterSeconds: Math.ceil(result.retryAfterSeconds) };
		});
	} catch (error) {
		// Fail open: a limiter glitch must not lock out trusted editors. Tokens
		// are held by editors/admins (not anonymous), so availability wins here.
		console.error('[MCP] Rate-limit check failed; allowing request', error);
		return { allowed: true, retryAfterSeconds: 0 };
	}
}

export interface McpAuditEntry {
	tokenId: string;
	userId: string;
	tool: string;
	status: 'success' | 'denied' | 'error' | 'rate_limited';
	detail?: string | null;
	ip?: string | null;
}

/** Append an audit row. Best-effort: never throws (auditing must not break the request). */
export async function logMcpAudit(entry: McpAuditEntry): Promise<void> {
	try {
		await db.insert(table.mcpAuditLog).values({
			id: randomUUID(),
			tokenId: entry.tokenId,
			userId: entry.userId,
			tool: entry.tool,
			status: entry.status,
			detail: entry.detail ?? null,
			ip: entry.ip ?? null,
			createdAt: new Date()
		});
	} catch (error) {
		console.error('[MCP] Failed to write audit log entry', error);
	}
}
