/**
 * MCP Personal Access Token — pure core.
 *
 * Crypto + policy helpers for the authorized MCP server, with NO database or
 * SvelteKit-runtime imports so this module is unit-testable in isolation. The
 * database-backed CRUD lives in `mcp-token-store.ts`.
 */
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding';
import type { UserRole } from '$lib/data/user';

/** Human-recognizable prefix on every token's plaintext. */
export const MCP_TOKEN_PREFIX = 'lemon_pat_';

/** Number of plaintext chars (incl. prefix) kept as a non-secret display id. */
const DISPLAY_PREFIX_LENGTH = MCP_TOKEN_PREFIX.length + 6;

/**
 * Token capability. Deliberately coarse: the app has exactly two roles
 * (admin|editor) and every data write is gated by ['admin','editor'], while
 * user/role management (the only admin-exclusive capability) is never exposed
 * over MCP. So a token only needs to express read vs read+write.
 */
export type McpTokenScope = 'read' | 'write';

export const MCP_TOKEN_SCOPES: readonly McpTokenScope[] = ['read', 'write'] as const;

/** Roles that confer write capability on LemonTV data. */
export const MCP_WRITE_ROLES: readonly UserRole[] = ['admin', 'editor'] as const;

export function isMcpTokenScope(value: unknown): value is McpTokenScope {
	return value === 'read' || value === 'write';
}

/** Generate a fresh plaintext token: prefix + 32 bytes of base64url entropy. */
export function generateMcpToken(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(32));
	return `${MCP_TOKEN_PREFIX}${encodeBase64url(bytes)}`;
}

/** SHA-256 hex digest of the plaintext token — what we store and look up by. */
export function hashMcpToken(token: string): string {
	return encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
}

/** Non-secret prefix stored to identify a token in the UI (e.g. "lemon_pat_AbC123"). */
export function mcpTokenDisplayPrefix(token: string): string {
	return token.slice(0, DISPLAY_PREFIX_LENGTH);
}

/** Whether a plaintext string is shaped like one of our tokens. */
export function looksLikeMcpToken(token: string): boolean {
	return token.startsWith(MCP_TOKEN_PREFIX) && token.length > DISPLAY_PREFIX_LENGTH;
}

/**
 * Effective write capability of a token given the owner's CURRENT roles.
 *
 * A 'write' token resolves to read-only the instant its owner loses
 * editor/admin, so de-authorizing an editor immediately neutralizes their
 * tokens without per-token revocation. Read tokens never write.
 */
export function resolveCanWrite(scope: McpTokenScope, currentRoles: readonly string[]): boolean {
	return scope === 'write' && MCP_WRITE_ROLES.some((role) => currentRoles.includes(role));
}

/** True if the owner's current roles permit minting a token of this scope. */
export function canMintScope(scope: McpTokenScope, currentRoles: readonly string[]): boolean {
	// Read tokens require only an authenticated identity; write tokens require
	// that the user currently holds a write role.
	return scope === 'read' || resolveCanWrite('write', currentRoles);
}
