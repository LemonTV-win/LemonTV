import { describe, it, expect } from 'bun:test';
import { normalizeEventTeams, normalizeEventResults } from './event-args';

describe('normalizeEventTeams', () => {
	it('defaults entry to "open" and status to "active"', () => {
		expect(normalizeEventTeams([{ teamId: 't1' }])).toEqual([
			{ teamId: 't1', entry: 'open', status: 'active' }
		]);
	});

	it('keeps provided entry/status and trims teamId', () => {
		expect(
			normalizeEventTeams([{ teamId: '  t1  ', entry: 'invited', status: 'eliminated' }])
		).toEqual([{ teamId: 't1', entry: 'invited', status: 'eliminated' }]);
	});

	it('rejects an empty array', () => {
		expect(() => normalizeEventTeams([])).toThrow(/non-empty array/);
	});

	it('rejects a non-array', () => {
		expect(() => normalizeEventTeams({ teamId: 't1' })).toThrow(/non-empty array/);
	});

	it('rejects a missing teamId', () => {
		expect(() => normalizeEventTeams([{ entry: 'open' }])).toThrow(/teamId/);
	});

	it('rejects an invalid entry value', () => {
		expect(() => normalizeEventTeams([{ teamId: 't1', entry: 'champion' }])).toThrow(/entry/);
	});

	it('rejects an invalid status value', () => {
		expect(() => normalizeEventTeams([{ teamId: 't1', status: 'winner' }])).toThrow(/status/);
	});

	it('rejects duplicate teamIds', () => {
		expect(() => normalizeEventTeams([{ teamId: 't1' }, { teamId: 't1' }])).toThrow(/duplicate/);
	});
});

describe('normalizeEventResults', () => {
	it('normalizes a minimal result with nulls for optional fields', () => {
		expect(normalizeEventResults([{ teamId: 't1', rank: 1 }])).toEqual([
			{ teamId: 't1', rank: 1, rankTo: null, prizeAmount: null, prizeCurrency: null }
		]);
	});

	it('accepts a shared placement range and prize', () => {
		expect(
			normalizeEventResults([
				{ teamId: 't1', rank: 5, rankTo: 8, prizeAmount: 1000, prizeCurrency: 'USD' }
			])
		).toEqual([{ teamId: 't1', rank: 5, rankTo: 8, prizeAmount: 1000, prizeCurrency: 'USD' }]);
	});

	it('accepts numeric strings for rank', () => {
		expect(normalizeEventResults([{ teamId: 't1', rank: '2' }])[0].rank).toBe(2);
	});

	it('rejects rank < 1', () => {
		expect(() => normalizeEventResults([{ teamId: 't1', rank: 0 }])).toThrow(/rank/);
	});

	it('rejects a non-integer rank', () => {
		expect(() => normalizeEventResults([{ teamId: 't1', rank: 1.5 }])).toThrow(/rank/);
	});

	it('rejects rankTo < rank', () => {
		expect(() => normalizeEventResults([{ teamId: 't1', rank: 4, rankTo: 2 }])).toThrow(/rankTo/);
	});

	it('rejects a negative prizeAmount', () => {
		expect(() => normalizeEventResults([{ teamId: 't1', rank: 1, prizeAmount: -5 }])).toThrow(
			/prizeAmount/
		);
	});

	it('rejects duplicate teamIds', () => {
		expect(() =>
			normalizeEventResults([
				{ teamId: 't1', rank: 1 },
				{ teamId: 't1', rank: 2 }
			])
		).toThrow(/duplicate/);
	});

	it('rejects an empty array', () => {
		expect(() => normalizeEventResults([])).toThrow(/non-empty array/);
	});
});
