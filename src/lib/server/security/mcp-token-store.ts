/**
 * MCP Personal Access Token — database-backed store.
 *
 * CRUD + validation for MCP tokens, built on the pure core in `mcp-token.ts`.
 * Mirrors the session-token primitives in `$lib/server/auth.ts`.
 */
import { and, desc, eq, isNull } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import type { UserRole } from '$lib/data/user';
import {
	canMintScope,
	generateMcpToken,
	hashMcpToken,
	looksLikeMcpToken,
	mcpTokenDisplayPrefix,
	resolveCanWrite,
	type McpTokenScope
} from './mcp-token';

/** Token fields safe to expose to the owner (never the hash). */
export type McpTokenSummary = Omit<table.McpToken, 'tokenHash'>;

export type McpTokenValidation =
	| {
			status: 'valid';
			token: McpTokenSummary;
			user: { id: string; username: string; email: string; roles: UserRole[] };
			/** Effective write capability given the owner's current roles. */
			canWrite: boolean;
	  }
	| { status: 'invalid'; reason: 'malformed' | 'not_found' | 'revoked' | 'expired' };

function stripHash(record: table.McpToken): McpTokenSummary {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { tokenHash, ...rest } = record;
	return rest;
}

async function getUserRoleIds(userId: string): Promise<UserRole[]> {
	const rows = await db
		.select({ roleId: table.userRole.roleId })
		.from(table.userRole)
		.where(eq(table.userRole.userId, userId));
	return rows.map((r) => r.roleId as UserRole);
}

/**
 * Mint a new token for `userId`. Returns the one-time plaintext alongside the
 * stored summary. Throws if the user's current roles cannot grant `scope`.
 */
export async function createMcpToken(params: {
	userId: string;
	name: string;
	scope: McpTokenScope;
	expiresAt: Date | null;
}): Promise<{ token: string; record: McpTokenSummary }> {
	const roles = await getUserRoleIds(params.userId);
	if (!canMintScope(params.scope, roles)) {
		throw new Error('Cannot mint a write token without an editor or admin role');
	}

	const token = generateMcpToken();
	const record: table.NewMcpToken = {
		id: crypto.randomUUID(),
		userId: params.userId,
		name: params.name,
		tokenHash: hashMcpToken(token),
		prefix: mcpTokenDisplayPrefix(token),
		scope: params.scope,
		createdAt: new Date(),
		expiresAt: params.expiresAt,
		lastUsedAt: null,
		revokedAt: null
	};

	const [inserted] = await db.insert(table.mcpToken).values(record).returning();
	return { token, record: stripHash(inserted) };
}

/**
 * Validate a presented plaintext token. On success, resolves the owner with
 * their CURRENT roles and the token's effective write capability, and stamps
 * `lastUsedAt` (best effort).
 */
export async function validateMcpToken(token: string): Promise<McpTokenValidation> {
	if (!looksLikeMcpToken(token)) {
		return { status: 'invalid', reason: 'malformed' };
	}

	const [record] = await db
		.select()
		.from(table.mcpToken)
		.where(eq(table.mcpToken.tokenHash, hashMcpToken(token)));

	if (!record) return { status: 'invalid', reason: 'not_found' };
	if (record.revokedAt) return { status: 'invalid', reason: 'revoked' };
	if (record.expiresAt && Date.now() >= record.expiresAt.getTime()) {
		return { status: 'invalid', reason: 'expired' };
	}

	const [owner] = await db
		.select({ id: table.user.id, username: table.user.username, email: table.user.email })
		.from(table.user)
		.where(eq(table.user.id, record.userId));

	if (!owner) return { status: 'invalid', reason: 'not_found' };

	const roles = await getUserRoleIds(owner.id);

	// Best-effort usage stamp; never fail validation on this.
	try {
		await db
			.update(table.mcpToken)
			.set({ lastUsedAt: new Date() })
			.where(eq(table.mcpToken.id, record.id));
	} catch (error) {
		console.warn('[MCP] Failed to update lastUsedAt for token', record.id, error);
	}

	return {
		status: 'valid',
		token: stripHash(record),
		user: { ...owner, roles },
		canWrite: resolveCanWrite(record.scope, roles)
	};
}

/** List a user's tokens (newest first), without secrets. */
export async function listMcpTokens(userId: string): Promise<McpTokenSummary[]> {
	const rows = await db
		.select()
		.from(table.mcpToken)
		.where(eq(table.mcpToken.userId, userId))
		.orderBy(desc(table.mcpToken.createdAt));
	return rows.map(stripHash);
}

/**
 * Revoke one of the user's own active tokens. Scoped by `userId` so a user can
 * never revoke another user's token. Returns whether a row was revoked.
 */
export async function revokeMcpToken(id: string, userId: string): Promise<boolean> {
	const revoked = await db
		.update(table.mcpToken)
		.set({ revokedAt: new Date() })
		.where(
			and(
				eq(table.mcpToken.id, id),
				eq(table.mcpToken.userId, userId),
				isNull(table.mcpToken.revokedAt)
			)
		)
		.returning({ id: table.mcpToken.id });
	return revoked.length > 0;
}
