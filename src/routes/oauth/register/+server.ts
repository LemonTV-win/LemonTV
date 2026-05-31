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

export const POST: RequestHandler = async ({ request }) => {
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
