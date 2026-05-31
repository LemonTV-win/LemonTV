import { describe, it, expect } from 'bun:test';
import { validateDcrRequest } from './dcr-core';

describe('validateDcrRequest', () => {
	it('accepts a minimal valid public client', () => {
		const r = validateDcrRequest({ redirect_uris: ['https://app.example/cb'] });
		expect(r.ok).toBe(true);
		if (r.ok) expect(r.value.redirectUris).toEqual(['https://app.example/cb']);
	});

	it('accepts loopback http redirect URIs (native clients)', () => {
		const r = validateDcrRequest({
			redirect_uris: ['http://127.0.0.1:1234/cb', 'http://localhost:55000/callback'],
			client_name: 'Claude Code'
		});
		expect(r.ok).toBe(true);
	});

	it('rejects missing or empty redirect_uris', () => {
		expect(validateDcrRequest({}).ok).toBe(false);
		expect(validateDcrRequest({ redirect_uris: [] }).ok).toBe(false);
		expect(validateDcrRequest({ redirect_uris: 'https://x/cb' }).ok).toBe(false);
	});

	it('rejects non-loopback http and fragments', () => {
		expect(validateDcrRequest({ redirect_uris: ['http://evil.example/cb'] }).ok).toBe(false);
		expect(validateDcrRequest({ redirect_uris: ['https://app.example/cb#x'] }).ok).toBe(false);
	});

	it('rejects confidential auth methods (public clients only)', () => {
		const r = validateDcrRequest({
			redirect_uris: ['https://app.example/cb'],
			token_endpoint_auth_method: 'client_secret_basic'
		});
		expect(r.ok).toBe(false);
	});

	it('accepts token_endpoint_auth_method "none"', () => {
		const r = validateDcrRequest({
			redirect_uris: ['https://app.example/cb'],
			token_endpoint_auth_method: 'none'
		});
		expect(r.ok).toBe(true);
	});

	it('rejects unsupported grant/response types', () => {
		expect(
			validateDcrRequest({ redirect_uris: ['https://a/cb'], grant_types: ['password'] }).ok
		).toBe(false);
		expect(
			validateDcrRequest({ redirect_uris: ['https://a/cb'], response_types: ['token'] }).ok
		).toBe(false);
	});

	it('rejects too many redirect_uris', () => {
		const many = Array.from({ length: 11 }, (_, i) => `https://app.example/cb${i}`);
		expect(validateDcrRequest({ redirect_uris: many }).ok).toBe(false);
	});

	it('rejects non-https client_uri / logo_uri', () => {
		expect(validateDcrRequest({ redirect_uris: ['https://a/cb'], client_uri: 'http://x' }).ok).toBe(
			false
		);
		expect(validateDcrRequest({ redirect_uris: ['https://a/cb'], logo_uri: 'ftp://x' }).ok).toBe(
			false
		);
	});
});
