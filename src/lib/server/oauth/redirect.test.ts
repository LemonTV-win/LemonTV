import { describe, it, expect } from 'bun:test';
import { safeInternalPath } from './redirect';

describe('safeInternalPath', () => {
	it('allows same-origin absolute paths (with query/hash)', () => {
		expect(safeInternalPath('/oauth/authorize?client_id=x&state=y')).toBe(
			'/oauth/authorize?client_id=x&state=y'
		);
		expect(safeInternalPath('/')).toBe('/');
		expect(safeInternalPath('/admin#section')).toBe('/admin#section');
	});

	it('falls back for absolute URLs (open-redirect)', () => {
		expect(safeInternalPath('https://evil.example/x')).toBe('/');
		expect(safeInternalPath('http://evil.example')).toBe('/');
	});

	it('falls back for protocol-relative and backslash tricks', () => {
		expect(safeInternalPath('//evil.example')).toBe('/');
		expect(safeInternalPath('/\\evil.example')).toBe('/');
	});

	it('falls back for non-path, empty, and null', () => {
		expect(safeInternalPath('javascript:alert(1)')).toBe('/');
		expect(safeInternalPath('evil.example')).toBe('/');
		expect(safeInternalPath('')).toBe('/');
		expect(safeInternalPath(null)).toBe('/');
		expect(safeInternalPath(undefined)).toBe('/');
	});

	it('falls back for paths with control characters (header splitting)', () => {
		expect(safeInternalPath('/a\nSet-Cookie: x')).toBe('/');
		expect(safeInternalPath('/a\r\nLocation: https://evil')).toBe('/');
	});

	it('honours a custom fallback', () => {
		expect(safeInternalPath(null, '/home')).toBe('/home');
		expect(safeInternalPath('https://evil', '/home')).toBe('/home');
	});
});
