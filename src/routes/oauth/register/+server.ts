/**
 * Dynamic Client Registration (RFC 7591). Public, unauthenticated — MCP clients
 * self-register to obtain a client_id before starting the PKCE flow. Accepts a
 * JSON body; there is no client secret (public clients only). CSRF-exempt in
 * hooks because it carries no ambient credentials (nothing for CSRF to abuse).
 */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateDcrRequest, type DcrRequestBody } from '$lib/server/oauth/dcr-core';
import { registerClient } from '$lib/server/oauth/store';
import { consumeRateLimit } from '$lib/server/mcp/hooks';
import { REGISTER_BUCKET } from '$lib/server/mcp/rate-limit';

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	// Throttle this unauthenticated, DB-writing endpoint per client IP so it can't
	// be flooded with throwaway client registrations. Resolve the IP via the
	// adapter's getClientAddress() (which knows the proxy config), falling back to
	// X-Forwarded-For. If it genuinely can't be determined, SKIP the throttle
	// rather than collapse every such request into one shared bucket (which would
	// let a few requests 429 unrelated clients).
	let ip: string | null = null;
	try {
		ip = getClientAddress();
	} catch {
		ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
	}
	if (ip) {
		const rl = await consumeRateLimit(`ip:register:${ip}`, REGISTER_BUCKET);
		if (!rl.allowed) {
			return json(
				{
					error: 'temporarily_unavailable',
					error_description: 'too many registrations; slow down'
				},
				{
					status: 429,
					headers: { 'Cache-Control': 'no-store', 'Retry-After': String(rl.retryAfterSeconds) }
				}
			);
		}
	}

	let body: DcrRequestBody;
	try {
		body = (await request.json()) as DcrRequestBody;
	} catch {
		return json(
			{ error: 'invalid_client_metadata', error_description: 'body must be JSON' },
			{ status: 400, headers: { 'Cache-Control': 'no-store' } }
		);
	}

	const result = validateDcrRequest(body);
	if (!result.ok) {
		return json(
			{ error: result.error, error_description: result.description },
			{ status: 400, headers: { 'Cache-Control': 'no-store' } }
		);
	}

	const client = await registerClient(result.value);

	return json(
		{
			client_id: client.id,
			client_id_issued_at: Math.floor(client.createdAt.getTime() / 1000),
			token_endpoint_auth_method: 'none',
			grant_types: ['authorization_code', 'refresh_token'],
			response_types: ['code'],
			redirect_uris: result.value.redirectUris,
			client_name: client.clientName ?? undefined,
			client_uri: client.clientUri ?? undefined,
			logo_uri: client.logoUri ?? undefined,
			scope: client.scope ?? undefined
		},
		{ status: 201, headers: { 'Cache-Control': 'no-store' } }
	);
};
