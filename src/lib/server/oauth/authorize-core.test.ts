import { describe, it, expect } from 'bun:test';
import { checkAuthorizeParams, buildRedirect, type AuthorizeParams } from './authorize-core';
import { MCP_RESOURCE } from './config';

const REGISTERED = ['https://app.example/cb'];
const CHALLENGE = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM'; // 43 chars

function params(overrides: Partial<AuthorizeParams> = {}): AuthorizeParams {
	return {
		responseType: 'code',
		clientId: 'client-1',
		redirectUri: 'https://app.example/cb',
		codeChallenge: CHALLENGE,
		codeChallengeMethod: 'S256',
		scope: 'mcp:read mcp:write',
		state: 'xyz',
		resource: MCP_RESOURCE,
		...overrides
	};
}

describe('checkAuthorizeParams — pre-redirect gate (no redirect on these)', () => {
	it('invalid when client_id missing', () => {
		const r = checkAuthorizeParams(params({ clientId: null }), REGISTERED);
		expect(r.status).toBe('invalid');
	});
	it('invalid when redirect_uri missing', () => {
		const r = checkAuthorizeParams(params({ redirectUri: null }), REGISTERED);
		expect(r.status).toBe('invalid');
	});
	it('invalid when redirect_uri does not match a registered URI', () => {
		const r = checkAuthorizeParams(params({ redirectUri: 'https://app.example/evil' }), REGISTERED);
		expect(r.status).toBe('invalid');
	});
	it('invalid when client is unknown (no registered URIs)', () => {
		const r = checkAuthorizeParams(params(), []);
		expect(r.status).toBe('invalid');
	});
});

describe('checkAuthorizeParams — post-gate errors redirect back', () => {
	it('unsupported_response_type', () => {
		const r = checkAuthorizeParams(params({ responseType: 'token' }), REGISTERED);
		expect(r.status).toBe('redirect_error');
		if (r.status === 'redirect_error') expect(r.error).toBe('unsupported_response_type');
	});
	it('requires PKCE code_challenge', () => {
		const r = checkAuthorizeParams(params({ codeChallenge: null }), REGISTERED);
		expect(r.status).toBe('redirect_error');
		if (r.status === 'redirect_error') expect(r.error).toBe('invalid_request');
	});
	it('rejects non-S256 (and absent) code_challenge_method', () => {
		expect(checkAuthorizeParams(params({ codeChallengeMethod: 'plain' }), REGISTERED).status).toBe(
			'redirect_error'
		);
		expect(checkAuthorizeParams(params({ codeChallengeMethod: null }), REGISTERED).status).toBe(
			'redirect_error'
		);
	});
	it('rejects unsupported scope', () => {
		const r = checkAuthorizeParams(params({ scope: 'mcp:read admin' }), REGISTERED);
		expect(r.status).toBe('redirect_error');
		if (r.status === 'redirect_error') expect(r.error).toBe('invalid_scope');
	});
	it('rejects a resource other than the MCP resource', () => {
		const r = checkAuthorizeParams(params({ resource: 'https://lemontv.win/other' }), REGISTERED);
		expect(r.status).toBe('redirect_error');
		if (r.status === 'redirect_error') expect(r.error).toBe('invalid_target');
	});
});

describe('checkAuthorizeParams — success', () => {
	it('passes a well-formed request and normalizes scope', () => {
		const r = checkAuthorizeParams(params(), REGISTERED);
		expect(r.status).toBe('ok');
		if (r.status === 'ok') {
			expect(r.scopes).toEqual(['mcp:read', 'mcp:write']);
			expect(r.resource).toBe(MCP_RESOURCE);
			expect(r.codeChallenge).toBe(CHALLENGE);
			expect(r.state).toBe('xyz');
		}
	});
	it('defaults scope to mcp:read and resource to the MCP resource when omitted', () => {
		const r = checkAuthorizeParams(params({ scope: null, resource: null }), REGISTERED);
		expect(r.status).toBe('ok');
		if (r.status === 'ok') {
			expect(r.scopes).toEqual(['mcp:read']);
			expect(r.resource).toBe(MCP_RESOURCE);
		}
	});
});

describe('buildRedirect', () => {
	it('appends params and preserves existing query', () => {
		const out = buildRedirect('https://app.example/cb?foo=1', { code: 'abc', state: 'xyz' });
		const u = new URL(out);
		expect(u.searchParams.get('foo')).toBe('1');
		expect(u.searchParams.get('code')).toBe('abc');
		expect(u.searchParams.get('state')).toBe('xyz');
	});
	it('skips null/undefined params (e.g. absent state)', () => {
		const out = buildRedirect('https://app.example/cb', { error: 'access_denied', state: null });
		const u = new URL(out);
		expect(u.searchParams.get('error')).toBe('access_denied');
		expect(u.searchParams.has('state')).toBe(false);
	});
});
