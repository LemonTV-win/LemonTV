/**
 * Resolve an MCP identity from an OAuth access token.
 *
 * Verifies the JWT (aud-bound to the MCP resource), then loads the user and
 * their CURRENT roles from the DB — roles are never trusted from the token, so
 * de-authorizing an editor instantly defangs outstanding tokens (matching the
 * PAT path).
 *
 * Scope gate (least privilege): a token MUST carry `mcp:read` to get any access
 * (the dispatcher serves tools/list + every read tool to any returned identity,
 * so a scope-less token must be rejected, not silently granted read). `mcp:write`
 * implies read. Write additionally requires a live editor/admin role.
 */
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import type { UserRole } from '$lib/data/user';
import type { McpIdentity } from '$lib/server/mcp/server';
import { MCP_WRITE_ROLES } from '$lib/server/security/mcp-token';
import { parseScope } from './scope';
import { verifyAccessToken } from './token';

export async function identityFromOAuthToken(jwt: string): Promise<McpIdentity | null> {
	const claims = await verifyAccessToken(jwt);
	if (!claims) return null;

	const [owner] = await db
		.select({ id: table.user.id, username: table.user.username })
		.from(table.user)
		.where(eq(table.user.id, claims.sub));
	if (!owner) return null;

	const roleRows = await db
		.select({ roleId: table.userRole.roleId })
		.from(table.userRole)
		.where(eq(table.userRole.userId, owner.id));
	const roles = roleRows.map((r) => r.roleId as UserRole);

	const scopes = parseScope(claims.scope);
	const hasWriteScope = scopes.includes('mcp:write');
	// mcp:write implies read. A token granting neither has no MCP access at all.
	const hasReadScope = hasWriteScope || scopes.includes('mcp:read');
	if (!hasReadScope) return null;

	const canWrite = hasWriteScope && MCP_WRITE_ROLES.some((role) => roles.includes(role));

	return {
		// Rate-limit + audit subject. MUST be stable across token refreshes — the
		// access-token `jti` rotates on every refresh, so keying on it would let a
		// caller reset its rate-limit bucket by refreshing. Key on the user instead
		// (the human's MCP quota), which a refresh cannot change.
		tokenId: `oauth:${owner.id}`,
		userId: owner.id,
		username: owner.username,
		canWrite
	};
}
