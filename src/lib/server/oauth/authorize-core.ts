/**
 * /authorize request validation (RFC 6749 §4.1.1 + PKCE + RFC 8707) — pure.
 *
 * The redirect-URI decision gate is the security-critical part:
 *  - If client_id is unknown OR redirect_uri doesn't EXACTLY match one the client
 *    registered, we must NOT redirect (could leak codes to an attacker URI) →
 *    status 'invalid' (render an error page).
 *  - Once the redirect_uri is trusted, every other failure is reported by
 *    redirecting back to it with an `error` param → status 'redirect_error'.
 */
import { redirectUriMatches } from './pkce';
import { parseScope, allScopesSupported } from './scope';
import { MCP_RESOURCE, DEFAULT_SCOPE } from './config';

export interface AuthorizeParams {
	responseType: string | null;
	clientId: string | null;
	redirectUri: string | null;
	codeChallenge: string | null;
	codeChallengeMethod: string | null;
	scope: string | null;
	state: string | null;
	resource: string | null;
}

export type AuthorizeCheck =
	| { status: 'invalid'; error: string; description: string }
	| {
			status: 'redirect_error';
			error: string;
			description: string;
			redirectUri: string;
			state: string | null;
	  }
	| {
			status: 'ok';
			redirectUri: string;
			scopes: string[];
			scope: string;
			resource: string;
			codeChallenge: string;
			state: string | null;
	  };

/**
 * @param registeredRedirectUris the client's registered URIs (empty if the
 *   client_id is unknown — which forces a non-redirecting 'invalid').
 */
export function checkAuthorizeParams(
	p: AuthorizeParams,
	registeredRedirectUris: readonly string[]
): AuthorizeCheck {
	// --- Pre-redirect gate: client_id + redirect_uri must be trusted first. ---
	if (!p.clientId) {
		return { status: 'invalid', error: 'invalid_request', description: 'missing client_id' };
	}
	if (!p.redirectUri) {
		return { status: 'invalid', error: 'invalid_request', description: 'missing redirect_uri' };
	}
	if (!redirectUriMatches(registeredRedirectUris, p.redirectUri)) {
		return {
			status: 'invalid',
			error: 'invalid_request',
			description: 'unknown client or redirect_uri does not match a registered URI'
		};
	}

	const redirectUri = p.redirectUri;
	const state = p.state;
	const rejectViaRedirect = (error: string, description: string): AuthorizeCheck => ({
		status: 'redirect_error',
		error,
		description,
		redirectUri,
		state
	});

	// --- Post-gate: errors are now safe to deliver to the trusted redirect_uri. ---
	if (p.responseType !== 'code') {
		return rejectViaRedirect('unsupported_response_type', 'response_type must be "code"');
	}
	if (!p.codeChallenge) {
		return rejectViaRedirect('invalid_request', 'code_challenge is required (PKCE)');
	}
	// PKCE: S256 only. Absent method defaults to "plain" in RFC 7636 — which we reject.
	if (p.codeChallengeMethod !== 'S256') {
		return rejectViaRedirect('invalid_request', 'code_challenge_method must be S256');
	}
	if (p.codeChallenge.length < 43 || p.codeChallenge.length > 128) {
		return rejectViaRedirect('invalid_request', 'malformed code_challenge');
	}

	let scopes = parseScope(p.scope);
	if (scopes.length === 0) scopes = parseScope(DEFAULT_SCOPE);
	if (!allScopesSupported(scopes)) {
		return rejectViaRedirect('invalid_scope', 'requested scope is not supported');
	}

	// RFC 8707: if a resource is named it must be exactly our MCP resource.
	const resource = p.resource ?? MCP_RESOURCE;
	if (resource !== MCP_RESOURCE) {
		return rejectViaRedirect('invalid_target', 'resource must be the MCP resource');
	}

	return {
		status: 'ok',
		redirectUri,
		scopes,
		scope: scopes.join(' '),
		resource,
		codeChallenge: p.codeChallenge,
		state
	};
}

/** Build an absolute redirect URL with appended query params, preserving existing ones. */
export function buildRedirect(
	redirectUri: string,
	params: Record<string, string | null | undefined>
): string {
	const url = new URL(redirectUri);
	for (const [k, v] of Object.entries(params)) {
		if (v !== null && v !== undefined) url.searchParams.set(k, v);
	}
	return url.toString();
}
