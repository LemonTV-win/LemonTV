import { describe, expect, it } from 'bun:test';
import {
	safeFormatDate,
	safeFormatEventDate,
	safeGetTimestamp,
	safeParseDate,
	safeParseDateRange
} from './date';

const isoFormatter = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' });

describe('safeParseDate', () => {
	it('returns a parsed date for ISO strings', () => {
		const parsed = safeParseDate('2024-05-10');
		expect(parsed?.getFullYear()).toBe(2024);
		expect(parsed?.getMonth()).toBe(4); // Note: 0-indexed
		expect(parsed?.getDate()).toBe(10);
	});

	it('returns the first entry when parsing a range', () => {
		const parsed = safeParseDate('2024-01-01/2024-01-03');
		expect(parsed?.toISOString().startsWith('2024-01-01')).toBe(true);
	});

	it('returns null for invalid input', () => {
		expect(safeParseDate('not-a-date')).toBeNull();
	});
});

describe('safeParseDateRange', () => {
	it('parses a full range when both dates are valid', () => {
		const parsed = safeParseDateRange('2024-01-01 / 2024-01-03');
		expect(parsed).toBeTruthy();
		expect(parsed?.start.toISOString().startsWith('2024-01-01')).toBe(true);
		expect(parsed?.end?.toISOString().startsWith('2024-01-03')).toBe(true);
	});

	it('returns null when any segment is invalid', () => {
		expect(safeParseDateRange('2024-01-01/not-a-date')).toBeNull();
	});

	it('returns only the start date when there is no end', () => {
		const parsed = safeParseDateRange('2024-05-02');
		expect(parsed?.start.toISOString().startsWith('2024-05-02')).toBe(true);
		expect(parsed?.end).toBeUndefined();
	});
});

describe('formatting helpers', () => {
	it('formats single dates with the provided formatter', () => {
		expect(safeFormatDate('2024-05-10', isoFormatter)).toBe('10 May 2024');
	});

	it('formats event ranges with localized strings', () => {
		const result = safeFormatEventDate('2024-01-01/2024-01-02');
		expect(result).toContain('2024');
		expect(result).toContain(' - ');
	});

	it('falls back to the invalid label when parsing fails', () => {
		expect(safeFormatEventDate('not-a-date')).toBe('Invalid Date');
		expect(safeFormatDate('not-a-date', isoFormatter)).toBe('Invalid Date');
	});
});

describe('safeGetTimestamp', () => {
	it('returns epoch milliseconds for valid dates', () => {
		expect(safeGetTimestamp('1970-01-01')).toBe(0);
	});

	it('returns zero when parsing fails', () => {
		expect(safeGetTimestamp('invalid')).toBe(0);
	});
});
