import { describe, it, expect } from 'bun:test';
import {
	requireString,
	requireInt,
	optionalInt,
	optionalBoolean,
	optionalEnum,
	requireEnum
} from './args';

describe('requireEnum', () => {
	const ROLES = ['active', 'substitute', 'coach'] as const;

	it('returns a valid value', () => {
		expect(requireEnum('coach', ROLES, 'role')).toBe('coach');
	});

	it('throws (never defaults) when absent or misspelled', () => {
		expect(() => requireEnum(undefined, ROLES, 'role')).toThrow('role');
		expect(() => requireEnum('actve', ROLES, 'role')).toThrow();
		expect(() => requireEnum('Active', ROLES, 'role')).toThrow(); // case-sensitive
		expect(() => requireEnum(null, ROLES, 'role')).toThrow();
	});
});

describe('requireInt', () => {
	it('returns integer numbers and numeric strings', () => {
		expect(requireInt({ accountId: 12345 }, 'accountId')).toBe(12345);
		expect(requireInt({ accountId: '6789' }, 'accountId')).toBe(6789);
		expect(requireInt({ accountId: 0 }, 'accountId')).toBe(0);
	});

	it('rejects null/undefined/missing (the Number(null)=0 footgun)', () => {
		expect(() => requireInt({ accountId: null }, 'accountId')).toThrow('accountId');
		expect(() => requireInt({ accountId: undefined }, 'accountId')).toThrow();
		expect(() => requireInt({}, 'accountId')).toThrow();
	});

	it('rejects non-integer / non-numeric values', () => {
		expect(() => requireInt({ accountId: 12.5 }, 'accountId')).toThrow();
		expect(() => requireInt({ accountId: 'abc' }, 'accountId')).toThrow();
		expect(() => requireInt({ accountId: '' }, 'accountId')).toThrow();
		expect(() => requireInt({ accountId: NaN }, 'accountId')).toThrow();
		expect(() => requireInt({ accountId: true }, 'accountId')).toThrow();
	});
});

describe('optionalInt', () => {
	it('returns the default for absent values and accepts numeric strings', () => {
		expect(optionalInt({}, 'capacity', 0)).toBe(0);
		expect(optionalInt({ capacity: null }, 'capacity', 8)).toBe(8);
		expect(optionalInt({ capacity: '24' }, 'capacity', 0)).toBe(24);
	});

	it('enforces a minimum when provided', () => {
		expect(optionalInt({ capacity: 0 }, 'capacity', 1, { min: 0 })).toBe(0);
		expect(() => optionalInt({ capacity: -1 }, 'capacity', 0, { min: 0 })).toThrow('capacity');
	});
});

describe('optionalBoolean', () => {
	it('accepts booleans and common MCP string/number forms', () => {
		expect(optionalBoolean({ official: true }, 'official')).toBe(true);
		expect(optionalBoolean({ official: 'true' }, 'official')).toBe(true);
		expect(optionalBoolean({ official: '1' }, 'official')).toBe(true);
		expect(optionalBoolean({ official: 1 }, 'official')).toBe(true);
		expect(optionalBoolean({ official: false }, 'official')).toBe(false);
		expect(optionalBoolean({ official: 'false' }, 'official')).toBe(false);
		expect(optionalBoolean({ official: '0' }, 'official')).toBe(false);
		expect(optionalBoolean({ official: 0 }, 'official')).toBe(false);
	});

	it('returns the default when absent and rejects ambiguous values', () => {
		expect(optionalBoolean({}, 'official', true)).toBe(true);
		expect(() => optionalBoolean({ official: 'definitely' }, 'official')).toThrow('official');
	});
});

describe('optionalEnum', () => {
	const REGIONS = ['CN', 'APAC', 'NA', 'EU'] as const;

	it('returns undefined for absent values', () => {
		expect(optionalEnum(undefined, REGIONS, 'region')).toBeUndefined();
		expect(optionalEnum(null, REGIONS, 'region')).toBeUndefined();
	});

	it('returns the value when it is in the allowed set', () => {
		expect(optionalEnum('APAC', REGIONS, 'region')).toBe('APAC');
	});

	it('throws on a value outside the allowed set', () => {
		expect(() => optionalEnum('MARS', REGIONS, 'region')).toThrow('Invalid region');
		expect(() => optionalEnum('apac', REGIONS, 'region')).toThrow(); // case-sensitive
		expect(() => optionalEnum(7, REGIONS, 'region')).toThrow();
	});
});

describe('requireString', () => {
	it('returns the value for a valid non-empty string', () => {
		expect(requireString({ slug: 'origami-cup-4' }, 'slug')).toBe('origami-cup-4');
	});

	it('throws when a required field is missing (the create_event bug)', () => {
		// Previously String(undefined) === "undefined" slipped past the checks.
		expect(() => requireString({ name: 'x' }, 'slug')).toThrow(
			'Missing or invalid required field: slug'
		);
	});

	it('throws on undefined / null / non-string values', () => {
		expect(() => requireString({ slug: undefined }, 'slug')).toThrow();
		expect(() => requireString({ slug: null }, 'slug')).toThrow();
		expect(() => requireString({ slug: 123 }, 'slug')).toThrow();
		expect(() => requireString({ slug: {} }, 'slug')).toThrow();
	});

	it('throws on empty or whitespace-only strings', () => {
		expect(() => requireString({ slug: '' }, 'slug')).toThrow();
		expect(() => requireString({ slug: '   ' }, 'slug')).toThrow();
	});
});
