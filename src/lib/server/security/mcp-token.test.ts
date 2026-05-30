import { describe, it, expect } from 'bun:test';
import {
	MCP_TOKEN_PREFIX,
	MCP_TOKEN_SCOPES,
	canMintScope,
	generateMcpToken,
	hashMcpToken,
	isMcpTokenScope,
	looksLikeMcpToken,
	mcpTokenDisplayPrefix,
	resolveCanWrite
} from './mcp-token';

describe('generateMcpToken', () => {
	it('is prefixed and high-entropy', () => {
		const token = generateMcpToken();
		expect(token.startsWith(MCP_TOKEN_PREFIX)).toBe(true);
		// 32 bytes base64url ≈ 43 chars, plus the prefix.
		expect(token.length).toBeGreaterThan(MCP_TOKEN_PREFIX.length + 40);
	});

	it('is unique across calls', () => {
		const tokens = new Set(Array.from({ length: 100 }, () => generateMcpToken()));
		expect(tokens.size).toBe(100);
	});

	it('produces tokens recognized by looksLikeMcpToken', () => {
		expect(looksLikeMcpToken(generateMcpToken())).toBe(true);
	});
});

describe('hashMcpToken', () => {
	it('is a deterministic 64-char hex digest', () => {
		const token = generateMcpToken();
		const a = hashMcpToken(token);
		const b = hashMcpToken(token);
		expect(a).toBe(b);
		expect(a).toMatch(/^[0-9a-f]{64}$/);
	});

	it('differs for different tokens', () => {
		expect(hashMcpToken(generateMcpToken())).not.toBe(hashMcpToken(generateMcpToken()));
	});

	it('never equals the plaintext', () => {
		const token = generateMcpToken();
		expect(hashMcpToken(token)).not.toBe(token);
	});
});

describe('mcpTokenDisplayPrefix', () => {
	it('keeps the human prefix plus 6 chars and stays much shorter than the token', () => {
		const token = generateMcpToken();
		const prefix = mcpTokenDisplayPrefix(token);
		expect(prefix.startsWith(MCP_TOKEN_PREFIX)).toBe(true);
		expect(prefix.length).toBe(MCP_TOKEN_PREFIX.length + 6);
		expect(prefix.length).toBeLessThan(token.length);
		expect(token.startsWith(prefix)).toBe(true);
	});
});

describe('looksLikeMcpToken', () => {
	it('rejects foreign or truncated strings', () => {
		expect(looksLikeMcpToken('')).toBe(false);
		expect(looksLikeMcpToken('hello')).toBe(false);
		expect(looksLikeMcpToken('ghp_somethingelse')).toBe(false);
		expect(looksLikeMcpToken(MCP_TOKEN_PREFIX)).toBe(false);
	});
});

describe('isMcpTokenScope', () => {
	it('accepts only read and write', () => {
		expect(isMcpTokenScope('read')).toBe(true);
		expect(isMcpTokenScope('write')).toBe(true);
		expect(isMcpTokenScope('admin')).toBe(false);
		expect(isMcpTokenScope('')).toBe(false);
		expect(isMcpTokenScope(undefined)).toBe(false);
	});

	it('exposes exactly the two scopes', () => {
		expect([...MCP_TOKEN_SCOPES]).toEqual(['read', 'write']);
	});
});

describe('resolveCanWrite', () => {
	it('grants write only to write-scoped tokens whose owner currently holds a write role', () => {
		expect(resolveCanWrite('write', ['editor'])).toBe(true);
		expect(resolveCanWrite('write', ['admin'])).toBe(true);
		expect(resolveCanWrite('write', ['admin', 'editor'])).toBe(true);
	});

	it('never grants write to read-scoped tokens', () => {
		expect(resolveCanWrite('read', ['admin'])).toBe(false);
		expect(resolveCanWrite('read', ['editor'])).toBe(false);
	});

	it('downgrades a write token to read-only once the owner loses write roles', () => {
		// e.g. an editor who was demoted — the existing token instantly defangs.
		expect(resolveCanWrite('write', [])).toBe(false);
		expect(resolveCanWrite('write', ['some-other-role'])).toBe(false);
	});
});

describe('canMintScope', () => {
	it('lets anyone authenticated mint a read token', () => {
		expect(canMintScope('read', [])).toBe(true);
		expect(canMintScope('read', ['editor'])).toBe(true);
	});

	it('lets only current editors/admins mint a write token', () => {
		expect(canMintScope('write', ['editor'])).toBe(true);
		expect(canMintScope('write', ['admin'])).toBe(true);
		expect(canMintScope('write', [])).toBe(false);
		expect(canMintScope('write', ['proposer'])).toBe(false);
	});
});
