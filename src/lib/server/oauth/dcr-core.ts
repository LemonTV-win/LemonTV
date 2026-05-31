/**
 * Dynamic Client Registration request validation (RFC 7591) — pure.
 *
 * MCP clients are PUBLIC: the only auth method we accept is `none` (PKCE). We
 * validate redirect URIs strictly (https or loopback http, no fragment) because
 * everything downstream — exact-match at /authorize and /token — trusts them.
 */
import { isAcceptableRedirectUri } from './pkce';
import { MAX_REDIRECT_URIS } from './config';

export interface DcrRequestBody {
	redirect_uris?: unknown;
	client_name?: unknown;
	client_uri?: unknown;
	logo_uri?: unknown;
	scope?: unknown;
	software_id?: unknown;
	grant_types?: unknown;
	response_types?: unknown;
	token_endpoint_auth_method?: unknown;
}

export interface DcrMetadata {
	redirectUris: string[];
	clientName: string | null;
	clientUri: string | null;
	logoUri: string | null;
	scope: string | null;
	softwareId: string | null;
}

export type DcrResult =
	| { ok: true; value: DcrMetadata }
	| { ok: false; error: string; description: string };

const MAX_STR = 2048;

function optionalString(value: unknown): string | null | undefined {
	// undefined -> field absent (ok); null/wrong-type -> invalid; '' -> treated as absent
	if (value === undefined) return undefined;
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	if (trimmed.length === 0) return undefined;
	if (trimmed.length > MAX_STR) return null;
	return trimmed;
}

function isHttpsUri(value: string): boolean {
	try {
		return new URL(value).protocol === 'https:';
	} catch {
		return false;
	}
}

export function validateDcrRequest(body: DcrRequestBody): DcrResult {
	const invalid = (description: string, error = 'invalid_client_metadata'): DcrResult => ({
		ok: false,
		error,
		description
	});

	// redirect_uris — required, non-empty array of acceptable URIs.
	const uris = body.redirect_uris;
	if (!Array.isArray(uris) || uris.length === 0) {
		return invalid(
			'redirect_uris is required and must be a non-empty array',
			'invalid_redirect_uri'
		);
	}
	if (uris.length > MAX_REDIRECT_URIS) {
		return invalid(`too many redirect_uris (max ${MAX_REDIRECT_URIS})`, 'invalid_redirect_uri');
	}
	const redirectUris: string[] = [];
	for (const uri of uris) {
		if (typeof uri !== 'string' || !isAcceptableRedirectUri(uri)) {
			return invalid(
				`invalid redirect_uri: ${typeof uri === 'string' ? uri : typeof uri} (must be https, or http on localhost/127.0.0.1, with no fragment)`,
				'invalid_redirect_uri'
			);
		}
		redirectUris.push(uri);
	}

	// token_endpoint_auth_method — only public clients ('none').
	if (body.token_endpoint_auth_method !== undefined && body.token_endpoint_auth_method !== 'none') {
		return invalid('only token_endpoint_auth_method "none" (public client) is supported');
	}

	// grant_types / response_types — must be subsets of what we implement.
	if (body.grant_types !== undefined) {
		if (
			!Array.isArray(body.grant_types) ||
			!body.grant_types.every((g) => g === 'authorization_code' || g === 'refresh_token')
		) {
			return invalid('unsupported grant_types (only authorization_code, refresh_token)');
		}
	}
	if (body.response_types !== undefined) {
		if (!Array.isArray(body.response_types) || !body.response_types.every((r) => r === 'code')) {
			return invalid('unsupported response_types (only "code")');
		}
	}

	const clientName = optionalString(body.client_name);
	if (clientName === null) return invalid('client_name must be a string');
	const clientUri = optionalString(body.client_uri);
	if (clientUri === null) return invalid('client_uri must be a string');
	if (clientUri && !isHttpsUri(clientUri)) return invalid('client_uri must be https');
	const logoUri = optionalString(body.logo_uri);
	if (logoUri === null) return invalid('logo_uri must be a string');
	if (logoUri && !isHttpsUri(logoUri)) return invalid('logo_uri must be https');
	const scope = optionalString(body.scope);
	if (scope === null) return invalid('scope must be a string');
	const softwareId = optionalString(body.software_id);
	if (softwareId === null) return invalid('software_id must be a string');

	return {
		ok: true,
		value: {
			redirectUris,
			clientName: clientName ?? null,
			clientUri: clientUri ?? null,
			logoUri: logoUri ?? null,
			scope: scope ?? null,
			softwareId: softwareId ?? null
		}
	};
}
