import { describe, expect, it } from 'bun:test';
import { countryCodeToLocalizedName, formatSlug, toLocaleTitleCase } from './strings';

describe('countryCodeToLocalizedName', () => {
	it('returns the localized country name for a valid code', () => {
		expect(countryCodeToLocalizedName('US', 'en')).toBe('United States');
		expect(countryCodeToLocalizedName('JP', 'en')).toBe('Japan');
	});
});

describe('formatSlug', () => {
	it('replaces whitespace with hyphens and trims the name', () => {
		expect(formatSlug('  Lemon TV  ')).toBe('Lemon-TV');
	});

	it('removes disallowed characters and collapses hyphens', () => {
		expect(formatSlug('Hello!!! -- World??')).toBe('Hello-World');
	});

	it('preserves non-Latin characters', () => {
		expect(formatSlug('テスト 配信')).toBe('テスト-配信');
	});
});

describe('toLocaleTitleCase', () => {
	it('capitalizes the first letter of each word', () => {
		expect(toLocaleTitleCase('hello world', 'en-US')).toBe('Hello World');
	});

	it('respects locale specific casing rules', () => {
		expect(toLocaleTitleCase('istanbul', 'tr')).toBe('İstanbul');
	});
});
