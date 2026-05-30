import { describe, it, expect } from 'bun:test';
import { requireString, optionalEnum } from './args';

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
