/**
 * Authorized MCP server — HTTP transport.
 *
 * Speaks MCP over JSON-RPC via HTTP POST, authenticated by a LemonTV Personal
 * Access Token (`Authorization: Bearer lemon_pat_…`). NOT mounted under
 * /api/public/ (which is pre-auth) — this route authenticates every request
 * itself and resolves the caller's write capability before dispatch.
 */
import { json, error as kitError } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateMcpToken } from '$lib/server/security/mcp-token-store';
import { handleMcpMessage, type McpIdentity, type McpHooks } from '$lib/server/mcp/server';
import { consumeRateLimit, logMcpAudit } from '$lib/server/mcp/hooks';

function bearerToken(request: Request): string | null {
	const header = request.headers.get('authorization');
	if (!header) return null;
	const match = header.match(/^Bearer\s+(.+)$/i);
	return match ? match[1].trim() : null;
}

export const POST: RequestHandler = async ({ request }) => {
	const token = bearerToken(request);
	if (!token) {
		return json(
			{ jsonrpc: '2.0', id: null, error: { code: -32001, message: 'Missing bearer token' } },
			{ status: 401, headers: { 'WWW-Authenticate': 'Bearer' } }
		);
	}

	const validation = await validateMcpToken(token);
	if (validation.status !== 'valid') {
		return json(
			{
				jsonrpc: '2.0',
				id: null,
				error: { code: -32001, message: `Unauthorized (${validation.reason})` }
			},
			{ status: 401 }
		);
	}

	const identity: McpIdentity = {
		tokenId: validation.token.id,
		userId: validation.user.id,
		username: validation.user.username,
		canWrite: validation.canWrite
	};

	const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
	const hooks: McpHooks = {
		rateLimit: (id) => consumeRateLimit(id.tokenId),
		audit: (entry) =>
			logMcpAudit({ ...entry, tokenId: identity.tokenId, userId: identity.userId, ip })
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
