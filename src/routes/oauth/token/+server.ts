/**
 * OAuth token endpoint (RFC 6749 §4.1.3 / §6, OAuth 2.1). Accepts
 * `application/x-www-form-urlencoded` from public PKCE clients — CSRF-exempt in
 * hooks because security here comes from the code + PKCE verifier (or the
 * refresh token), never from an ambient cookie.
 *
 * Both authorization codes and refresh tokens are single-use; detecting reuse of
 * either triggers revocation of that (user,client)'s refresh tokens — the
 * OAuth 2.1 replay-detection defense against a leaked code/token.
 */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPkceS256 } from '$lib/server/oauth/pkce';
import { hashSecret } from '$lib/server/oauth/secret';
import { parseScope, isSubsetScope, serializeScope } from '$lib/server/oauth/scope';
import { mintAccessToken } from '$lib/server/oauth/token';
import {
	consumeAuthCode,
	consumeRefreshToken,
	issueRefreshToken,
	revokeRefreshTokensForUserClient
} from '$lib/server/oauth/store';
import { ACCESS_TOKEN_TTL_SECONDS, MCP_RESOURCE } from '$lib/server/oauth/config';

const NO_STORE = { 'Cache-Control': 'no-store', Pragma: 'no-cache' };

function oauthError(error: string, description: string, status = 400) {
	return json({ error, error_description: description }, { status, headers: NO_STORE });
}

interface TokenSuccess {
	userId: string;
	clientId: string;
	scope: string;
	resource: string;
}

async function success({ userId, clientId, scope, resource }: TokenSuccess) {
	const access_token = await mintAccessToken({ sub: userId, scope, clientId });
	const refresh_token = await issueRefreshToken({ userId, clientId, scope, resource });
	return json(
		{
			access_token,
			token_type: 'Bearer',
			expires_in: ACCESS_TOKEN_TTL_SECONDS,
			scope,
			refresh_token
		},
		{ headers: NO_STORE }
	);
}

export const POST: RequestHandler = async ({ request }) => {
	let form: FormData;
	try {
		form = await request.formData();
	} catch {
		return oauthError('invalid_request', 'body must be application/x-www-form-urlencoded');
	}
	const get = (k: string) => {
		const v = form.get(k);
		return typeof v === 'string' ? v : null;
	};

	const grantType = get('grant_type');

	// ------------------------------------------------ authorization_code ----
	if (grantType === 'authorization_code') {
		const code = get('code');
		const clientId = get('client_id');
		const redirectUri = get('redirect_uri');
		const codeVerifier = get('code_verifier');
		const resource = get('resource');

		if (!code || !clientId || !redirectUri || !codeVerifier) {
			return oauthError(
				'invalid_request',
				'missing code, client_id, redirect_uri, or code_verifier'
			);
		}

		const row = await consumeAuthCode(code);
		if (!row) {
			// Either never existed, expired, or a REPLAY of an already-spent code.
			// On replay, revoke any tokens already issued from it (OAuth 2.1).
			const [spent] = await db
				.select({ userId: table.oauthAuthCode.userId, clientId: table.oauthAuthCode.clientId })
				.from(table.oauthAuthCode)
				.where(eq(table.oauthAuthCode.tokenHash, hashSecret(code)));
			if (spent) await revokeRefreshTokensForUserClient(spent.userId, spent.clientId);
			return oauthError('invalid_grant', 'authorization code is invalid, expired, or already used');
		}

		if (row.clientId !== clientId) {
			return oauthError('invalid_grant', 'client_id does not match the authorization code');
		}
		if (row.redirectUri !== redirectUri) {
			return oauthError('invalid_grant', 'redirect_uri does not match the authorization request');
		}
		if (!verifyPkceS256(codeVerifier, row.codeChallenge)) {
			return oauthError('invalid_grant', 'PKCE verification failed');
		}
		if (resource && resource !== row.resource) {
			return oauthError('invalid_target', 'resource does not match the authorization request');
		}

		return success({
			userId: row.userId,
			clientId: row.clientId,
			scope: row.scope,
			resource: row.resource
		});
	}

	// ------------------------------------------------------ refresh_token ----
	if (grantType === 'refresh_token') {
		const refreshToken = get('refresh_token');
		const clientId = get('client_id');
		const requestedScope = get('scope');
		const resource = get('resource');

		if (!refreshToken || !clientId) {
			return oauthError('invalid_request', 'missing refresh_token or client_id');
		}

		const row = await consumeRefreshToken(refreshToken);
		if (!row) {
			// Reuse of a rotated/expired refresh token → revoke the whole chain.
			const [spent] = await db
				.select({
					userId: table.oauthRefreshToken.userId,
					clientId: table.oauthRefreshToken.clientId
				})
				.from(table.oauthRefreshToken)
				.where(eq(table.oauthRefreshToken.tokenHash, hashSecret(refreshToken)));
			if (spent) await revokeRefreshTokensForUserClient(spent.userId, spent.clientId);
			return oauthError('invalid_grant', 'refresh token is invalid, expired, or already used');
		}

		if (row.clientId !== clientId) {
			return oauthError('invalid_grant', 'client_id does not match the refresh token');
		}
		if (resource && resource !== row.resource) {
			return oauthError('invalid_target', 'resource does not match the refresh token');
		}

		// A refresh may narrow scope but never widen it.
		let scope = row.scope;
		const requested = parseScope(requestedScope);
		if (requested.length > 0) {
			if (!isSubsetScope(requested, parseScope(row.scope))) {
				return oauthError('invalid_scope', 'requested scope exceeds the granted scope');
			}
			scope = serializeScope(requested);
		}

		return success({
			userId: row.userId,
			clientId: row.clientId,
			scope,
			resource: row.resource || MCP_RESOURCE
		});
	}

	return oauthError(
		'unsupported_grant_type',
		'grant_type must be authorization_code or refresh_token'
	);
};
