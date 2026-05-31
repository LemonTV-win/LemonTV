/**
 * OAuth 2.1 configuration for the MCP authorization flow.
 *
 * Single source of truth so the metadata documents, the authorize/token
 * endpoints, and token validation can never drift. Free of env/SvelteKit
 * imports so it is safe to import from unit tests.
 */

// Mirrors SITE_CANONICAL_HOST in $lib/consts (inlined to keep this module
// import-free for tests).
export const OAUTH_ISSUER = 'https://lemontv.win';

/**
 * The canonical MCP resource identifier (RFC 8707). Access tokens are bound to
 * this as their `aud`; the MCP route rejects any token whose audience differs —
 * which is what keeps these tokens separate from the legacy /login/jwt SSO
 * tokens (whose aud is the redirect origin) even though both use the same key.
 */
export const MCP_RESOURCE = `${OAUTH_ISSUER}/api/mcp`;

export const OAUTH_SCOPES_SUPPORTED = ['mcp:read', 'mcp:write'] as const;
export type OAuthScope = (typeof OAUTH_SCOPES_SUPPORTED)[number];

export const PKCE_METHODS_SUPPORTED = ['S256'] as const;
export const OAUTH_RESPONSE_TYPES_SUPPORTED = ['code'] as const;
export const OAUTH_GRANT_TYPES_SUPPORTED = ['authorization_code', 'refresh_token'] as const;
export const TOKEN_ENDPOINT_AUTH_METHODS = ['none'] as const; // public (PKCE) clients

/** Authorization codes are single-use and very short-lived. */
export const AUTH_CODE_TTL_MS = 60_000;
/** Access tokens are short-lived; longevity comes from refresh-token rotation. */
export const ACCESS_TOKEN_TTL_SECONDS = 60 * 60;
/** Refresh tokens are long-lived but single-use (rotated on every exchange). */
export const REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

/** Grant types the token endpoint actually implements. */
export const OAUTH_TOKEN_GRANT_TYPES = ['authorization_code', 'refresh_token'] as const;

/** Default scope when an `/authorize` request omits `scope` — least privilege. */
export const DEFAULT_SCOPE = 'mcp:read';

/** Cap on redirect URIs a single dynamically-registered client may declare. */
export const MAX_REDIRECT_URIS = 10;

/** Signing key id — reuses the existing ES256 key served at /.well-known/jwks.json. */
export const JWT_KID = 'lemon-key';
export const JWT_ALG = 'ES256';

export const WELL_KNOWN_PROTECTED_RESOURCE = `${OAUTH_ISSUER}/.well-known/oauth-protected-resource`;
export const JWKS_URI = `${OAUTH_ISSUER}/.well-known/jwks.json`;
export const AUTHORIZATION_ENDPOINT = `${OAUTH_ISSUER}/oauth/authorize`;
export const TOKEN_ENDPOINT = `${OAUTH_ISSUER}/oauth/token`;
export const REGISTRATION_ENDPOINT = `${OAUTH_ISSUER}/oauth/register`;
