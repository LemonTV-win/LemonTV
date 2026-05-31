/**
 * OAuth 2.0 Protected Resource Metadata (RFC 9728). Advertises that the MCP
 * resource is protected and which authorization server issues tokens for it.
 * The MCP route's 401 `WWW-Authenticate` points here.
 */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { MCP_RESOURCE, OAUTH_ISSUER, OAUTH_SCOPES_SUPPORTED } from '$lib/server/oauth/config';

export const GET: RequestHandler = () => {
	return json(
		{
			resource: MCP_RESOURCE,
			authorization_servers: [OAUTH_ISSUER],
			scopes_supported: [...OAUTH_SCOPES_SUPPORTED],
			bearer_methods_supported: ['header']
		},
		{ headers: { 'Cache-Control': 'public, max-age=3600' } }
	);
};
