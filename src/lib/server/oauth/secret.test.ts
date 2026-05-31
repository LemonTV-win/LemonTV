import { describe, it, expect } from 'bun:test';
import {
	generateAuthCode,
	generateRefreshToken,
	generateClientId,
	hashSecret,
	REFRESH_TOKEN_PREFIX
} from './secret';

describe('opaque secret generation', () => {
	it('produces high-entropy, distinct values', () => {
		const a = generateAuthCode();
		const b = generateAuthCode();
		expect(a).not.toBe(b);
		expect(a.length).toBeGreaterThanOrEqual(43); // 32 bytes base64url
	});

	it('prefixes refresh tokens', () => {
		const t = generateRefreshToken();
		expect(t.startsWith(REFRESH_TOKEN_PREFIX)).toBe(true);
		expect(t.length).toBeGreaterThan(REFRESH_TOKEN_PREFIX.length + 20);
	});

	it('client ids are distinct and prefix-free', () => {
		expect(generateClientId()).not.toBe(generateClientId());
		expect(generateClientId().startsWith(REFRESH_TOKEN_PREFIX)).toBe(false);
	});
});

describe('hashSecret', () => {
	it('is deterministic and hex sha-256', () => {
		const h = hashSecret('lemon');
		expect(h).toBe(hashSecret('lemon'));
		expect(h).toMatch(/^[0-9a-f]{64}$/);
	});

	it('differs for different inputs', () => {
		expect(hashSecret('a')).not.toBe(hashSecret('b'));
	});
});
