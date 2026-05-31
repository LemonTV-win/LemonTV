/**
 * OAuth 2.0 Authorization Server Metadata (RFC 8414). Public — `/.well-known/`
 * is whitelisted in hooks. MCP clients discover the authorize/token/registration
 * endpoints here.
 */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	OAUTH_ISSUER,
	AUTHORIZATION_ENDPOINT,
	TOKEN_ENDPOINT,
	REGISTRATION_ENDPOINT,
	JWKS_URI,
	OAUTH_SCOPES_SUPPORTED,
	OAUTH_RESPONSE_TYPES_SUPPORTED,
	OAUTH_GRANT_TYPES_SUPPORTED,
	PKCE_METHODS_SUPPORTED,
	TOKEN_ENDPOINT_AUTH_METHODS
} from '$lib/server/oauth/config';

export const GET: RequestHandler = () => {
	return json(
		{
			issuer: OAUTH_ISSUER,
			authorization_endpoint: AUTHORIZATION_ENDPOINT,
			token_endpoint: TOKEN_ENDPOINT,
			registration_endpoint: REGISTRATION_ENDPOINT,
			jwks_uri: JWKS_URI,
			scopes_supported: [...OAUTH_SCOPES_SUPPORTED],
			response_types_supported: [...OAUTH_RESPONSE_TYPES_SUPPORTED],
			grant_types_supported: [...OAUTH_GRANT_TYPES_SUPPORTED],
			code_challenge_methods_supported: [...PKCE_METHODS_SUPPORTED],
			token_endpoint_auth_methods_supported: [...TOKEN_ENDPOINT_AUTH_METHODS]
		},
		{ headers: { 'Cache-Control': 'public, max-age=3600' } }
	);
};
