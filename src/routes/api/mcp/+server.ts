/**
 * Authorized MCP server — HTTP transport.
 *
 * Speaks MCP over JSON-RPC via HTTP POST. Two credential types are accepted:
 *  - a LemonTV Personal Access Token (`Authorization: Bearer lemon_pat_…`), or
 *  - an OAuth 2.1 access token (a JWT obtained via the browser login flow).
 * NOT mounted under /api/public/ (which is pre-auth) — this route authenticates
 * every request itself and resolves the caller's write capability before dispatch.
 * On 401 it advertises the OAuth resource metadata so MCP clients can discover
 * the login flow.
 */
import { json, error as kitError } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateMcpToken } from '$lib/server/security/mcp-token-store';
import { MCP_TOKEN_PREFIX } from '$lib/server/security/mcp-token';
import { handleMcpMessage, type McpIdentity, type McpHooks } from '$lib/server/mcp/server';
import { consumeRateLimit, logMcpAudit } from '$lib/server/mcp/hooks';
import { identityFromOAuthToken } from '$lib/server/oauth/identity';
import { WELL_KNOWN_PROTECTED_RESOURCE } from '$lib/server/oauth/config';

const WWW_AUTHENTICATE = `Bearer resource_metadata="${WELL_KNOWN_PROTECTED_RESOURCE}"`;

function bearerToken(request: Request): string | null {
	const header = request.headers.get('authorization');
	if (!header) return null;
	const match = header.match(/^Bearer\s+(.+)$/i);
	return match ? match[1].trim() : null;
}

function unauthorized(message: string) {
	return json(
		{ jsonrpc: '2.0', id: null, error: { code: -32001, message } },
		{ status: 401, headers: { 'WWW-Authenticate': WWW_AUTHENTICATE } }
	);
}

export const POST: RequestHandler = async ({ request }) => {
	const token = bearerToken(request);
	if (!token) return unauthorized('Missing bearer token');

	let identity: McpIdentity;

	if (token.startsWith(MCP_TOKEN_PREFIX)) {
		// Personal Access Token. identity.tokenId is the raw mcp_token.id.
		const validation = await validateMcpToken(token);
		if (validation.status !== 'valid') return unauthorized(`Unauthorized (${validation.reason})`);
		identity = {
			tokenId: validation.token.id,
			userId: validation.user.id,
			username: validation.user.username,
			canWrite: validation.canWrite
		};
	} else {
		// OAuth 2.1 access token (JWT). identity.tokenId is `oauth:<jti>`.
		const oauthIdentity = await identityFromOAuthToken(token);
		if (!oauthIdentity) return unauthorized('Unauthorized (invalid token)');
		identity = oauthIdentity;
	}

	// Both auth paths are now audited + rate-limited, keyed by the caller's
	// subject (identity.tokenId is a PAT id or `oauth:<jti>` — distinct namespaces).
	const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
	const hooks: McpHooks = {
		rateLimit: (id) => consumeRateLimit(id.tokenId),
		audit: (entry) =>
			logMcpAudit({ ...entry, subject: identity.tokenId, userId: identity.userId, ip })
	};

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json(
			{ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } },
			{ status: 400 }
		);
	}

	// JSON-RPC batch or single message.
	if (Array.isArray(body)) {
		// Process sequentially: parallel handling would let every message in a
		// batch read the same rate-limit bucket before any decrement is written,
		// so one large batch could run far above the per-token limit. Sequential
		// processing serializes each consume → write before the next call.
		const responses: object[] = [];
		for (const msg of body) {
			const r = await handleMcpMessage(msg as never, identity, hooks);
			if (r !== null) responses.push(r);
		}
		return responses.length === 0 ? new Response(null, { status: 202 }) : json(responses);
	}

	const response = await handleMcpMessage(body as never, identity, hooks);
	return response === null ? new Response(null, { status: 202 }) : json(response);
};

// This server does not support the optional server-initiated SSE stream.
export const GET: RequestHandler = () => {
	throw kitError(405, 'Method Not Allowed — POST JSON-RPC to this endpoint');
};
