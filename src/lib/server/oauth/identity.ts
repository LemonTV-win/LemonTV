/**
 * Resolve an MCP identity from an OAuth access token.
 *
 * Verifies the JWT (aud-bound to the MCP resource), then loads the user and
 * their CURRENT roles from the DB — roles are never trusted from the token, so
 * de-authorizing an editor instantly defangs outstanding tokens (matching the
 * PAT path). Write requires BOTH the `mcp:write` scope AND a live editor/admin role.
 */
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import type { UserRole } from '$lib/data/user';
import type { McpIdentity } from '$lib/server/mcp/server';
import { MCP_WRITE_ROLES } from '$lib/server/security/mcp-token';
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

	const hasWriteScope = claims.scope.split(' ').includes('mcp:write');
	const canWrite = hasWriteScope && MCP_WRITE_ROLES.some((role) => roles.includes(role));

	return {
		tokenId: `oauth:${claims.jti}`,
		userId: owner.id,
		username: owner.username,
		canWrite
	};
}
