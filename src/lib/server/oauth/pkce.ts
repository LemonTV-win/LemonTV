/**
 * PKCE (RFC 7636, S256 only) and redirect-URI matching — pure, unit-tested.
 *
 * The security of the public-client (no client secret) OAuth flow rests on
 * these: PKCE proves the token requester is the same party that started the
 * authorization, and exact redirect-URI matching prevents open-redirect / code
 * theft.
 */
import { createHash, timingSafeEqual } from 'node:crypto';

/** S256 code challenge = base64url(SHA-256(code_verifier)), no padding. */
export function computeS256Challenge(codeVerifier: string): string {
	return createHash('sha256').update(codeVerifier).digest('base64url');
}

function constantTimeEquals(a: string, b: string): boolean {
	const ab = Buffer.from(a);
	const bb = Buffer.from(b);
	if (ab.length !== bb.length) return false;
	return timingSafeEqual(ab, bb);
}

/** Verify a PKCE S256 code_verifier against the stored code_challenge. */
export function verifyPkceS256(codeVerifier: string, codeChallenge: string): boolean {
	if (!codeVerifier || !codeChallenge) return false;
	// RFC 7636: verifier is 43–128 chars of the unreserved set.
	if (codeVerifier.length < 43 || codeVerifier.length > 128) return false;
	return constantTimeEquals(computeS256Challenge(codeVerifier), codeChallenge);
}

/**
 * Exact redirect-URI match against the client's registered URIs. No
 * normalization, no prefix/substring, no wildcards — byte-for-byte.
 */
export function redirectUriMatches(registeredUris: readonly string[], presented: string): boolean {
	if (!presented) return false;
	return registeredUris.some((uri) => constantTimeEquals(uri, presented));
}

/**
 * A redirect URI acceptable for registration: absolute https, OR http only for
 * loopback (native clients). No fragment.
 */
export function isAcceptableRedirectUri(value: string): boolean {
	let url: URL;
	try {
		url = new URL(value);
	} catch {
		return false;
	}
	if (url.hash) return false;
	if (url.protocol === 'https:') return true;
	if (url.protocol === 'http:' && (url.hostname === 'localhost' || url.hostname === '127.0.0.1')) {
		return true;
	}
	return false;
}
