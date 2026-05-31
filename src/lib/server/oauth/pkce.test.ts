import { describe, it, expect } from 'bun:test';
import {
	computeS256Challenge,
	verifyPkceS256,
	redirectUriMatches,
	isAcceptableRedirectUri
} from './pkce';

// RFC 7636 Appendix B test vector.
const RFC_VERIFIER = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
const RFC_CHALLENGE = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM';

describe('PKCE S256', () => {
	it('matches the RFC 7636 test vector', () => {
		expect(computeS256Challenge(RFC_VERIFIER)).toBe(RFC_CHALLENGE);
		expect(verifyPkceS256(RFC_VERIFIER, RFC_CHALLENGE)).toBe(true);
	});

	it('rejects a wrong verifier', () => {
		expect(verifyPkceS256('x'.repeat(43), RFC_CHALLENGE)).toBe(false);
	});

	it('rejects verifiers outside the 43–128 length bound', () => {
		expect(verifyPkceS256('short', computeS256Challenge('short'))).toBe(false);
		expect(verifyPkceS256('x'.repeat(129), computeS256Challenge('x'.repeat(129)))).toBe(false);
	});

	it('rejects empty inputs', () => {
		expect(verifyPkceS256('', RFC_CHALLENGE)).toBe(false);
		expect(verifyPkceS256(RFC_VERIFIER, '')).toBe(false);
	});
});

describe('redirectUriMatches', () => {
	const registered = ['https://claude.ai/api/mcp/auth_callback', 'http://localhost:33418/callback'];

	it('matches an exact registered URI', () => {
		expect(redirectUriMatches(registered, 'https://claude.ai/api/mcp/auth_callback')).toBe(true);
	});

	it('rejects near-misses (trailing slash, extra query, different path)', () => {
		expect(redirectUriMatches(registered, 'https://claude.ai/api/mcp/auth_callback/')).toBe(false);
		expect(redirectUriMatches(registered, 'https://claude.ai/api/mcp/auth_callback?x=1')).toBe(
			false
		);
		expect(redirectUriMatches(registered, 'https://claude.ai/evil')).toBe(false);
		expect(redirectUriMatches(registered, 'https://evil.com/api/mcp/auth_callback')).toBe(false);
		expect(redirectUriMatches(registered, '')).toBe(false);
	});
});

describe('isAcceptableRedirectUri', () => {
	it('accepts absolute https and loopback http', () => {
		expect(isAcceptableRedirectUri('https://claude.ai/callback')).toBe(true);
		expect(isAcceptableRedirectUri('http://localhost:1234/cb')).toBe(true);
		expect(isAcceptableRedirectUri('http://127.0.0.1:1234/cb')).toBe(true);
	});

	it('rejects non-loopback http, fragments, and garbage', () => {
		expect(isAcceptableRedirectUri('http://evil.com/cb')).toBe(false);
		expect(isAcceptableRedirectUri('https://ok.com/cb#frag')).toBe(false);
		expect(isAcceptableRedirectUri('not-a-url')).toBe(false);
		expect(isAcceptableRedirectUri('ftp://x/y')).toBe(false);
	});
});
