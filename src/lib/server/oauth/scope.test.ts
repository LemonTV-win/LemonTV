import { describe, it, expect } from 'bun:test';
import { parseScope, allScopesSupported, isSubsetScope, serializeScope } from './scope';

describe('parseScope', () => {
	it('splits on whitespace and drops empties', () => {
		expect(parseScope('mcp:read mcp:write')).toEqual(['mcp:read', 'mcp:write']);
		expect(parseScope('  mcp:read   mcp:write ')).toEqual(['mcp:read', 'mcp:write']);
		expect(parseScope('')).toEqual([]);
		expect(parseScope(null)).toEqual([]);
		expect(parseScope(undefined)).toEqual([]);
	});
});

describe('allScopesSupported', () => {
	it('accepts known scopes only', () => {
		expect(allScopesSupported(['mcp:read'])).toBe(true);
		expect(allScopesSupported(['mcp:read', 'mcp:write'])).toBe(true);
		expect(allScopesSupported([])).toBe(true);
		expect(allScopesSupported(['mcp:read', 'admin'])).toBe(false);
		expect(allScopesSupported(['openid'])).toBe(false);
	});
});

describe('isSubsetScope', () => {
	it('is true only when requested ⊆ granted (no widening on refresh)', () => {
		expect(isSubsetScope(['mcp:read'], ['mcp:read', 'mcp:write'])).toBe(true);
		expect(isSubsetScope(['mcp:read', 'mcp:write'], ['mcp:read', 'mcp:write'])).toBe(true);
		expect(isSubsetScope([], ['mcp:read'])).toBe(true);
		expect(isSubsetScope(['mcp:write'], ['mcp:read'])).toBe(false);
		expect(isSubsetScope(['mcp:read', 'mcp:write'], ['mcp:read'])).toBe(false);
	});
});

describe('serializeScope', () => {
	it('joins with spaces', () => {
		expect(serializeScope(['mcp:read', 'mcp:write'])).toBe('mcp:read mcp:write');
		expect(serializeScope([])).toBe('');
	});
});
