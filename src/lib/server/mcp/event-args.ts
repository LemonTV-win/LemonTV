/**
 * Pure argument normalizers for the event-participant / event-result MCP tools.
 *
 * Kept free of DB/SvelteKit imports so it is unit-testable in isolation, like
 * `args.ts`. The data layer stores these values without re-validating, so all
 * enum/shape checks must happen here.
 */

export const EVENT_TEAM_ENTRIES = [
	'open',
	'invited',
	'qualified',
	'host',
	'defending_champion',
	'regional_slot',
	'exhibition',
	'wildcard'
] as const;
export type EventTeamEntry = (typeof EVENT_TEAM_ENTRIES)[number];

export const EVENT_TEAM_STATUSES = ['active', 'disqualified', 'withdrawn', 'eliminated'] as const;
export type EventTeamStatus = (typeof EVENT_TEAM_STATUSES)[number];

export interface NormalizedEventTeam {
	teamId: string;
	entry: EventTeamEntry;
	status: EventTeamStatus;
}

export interface NormalizedEventResult {
	teamId: string;
	rank: number;
	rankTo: number | null;
	prizeAmount: number | null;
	prizeCurrency: string | null;
}

function asRecordArray(raw: unknown, field: string): Record<string, unknown>[] {
	if (!Array.isArray(raw) || raw.length === 0) {
		throw new Error(`${field} must be a non-empty array`);
	}
	return raw.map((item, i) => {
		if (typeof item !== 'object' || item === null || Array.isArray(item)) {
			throw new Error(`${field}[${i}] must be an object`);
		}
		return item as Record<string, unknown>;
	});
}

function requireStringField(obj: Record<string, unknown>, key: string, where: string): string {
	const value = obj[key];
	if (typeof value !== 'string' || value.trim() === '') {
		throw new Error(`${where}: missing or invalid "${key}"`);
	}
	return value.trim();
}

function optionalEnumField<T extends string>(
	obj: Record<string, unknown>,
	key: string,
	allowed: readonly T[],
	fallback: T,
	where: string
): T {
	const value = obj[key];
	if (value === undefined || value === null) return fallback;
	if (typeof value === 'string' && (allowed as readonly string[]).includes(value)) {
		return value as T;
	}
	throw new Error(`${where}: invalid "${key}" (expected one of ${allowed.join(', ')})`);
}

function requireIntField(obj: Record<string, unknown>, key: string, where: string): number {
	const value = obj[key];
	const n =
		typeof value === 'number'
			? value
			: typeof value === 'string' && value.trim() !== ''
				? Number(value)
				: NaN;
	if (!Number.isInteger(n)) {
		throw new Error(`${where}: missing or invalid "${key}" (expected an integer)`);
	}
	return n;
}

function optionalIntField(obj: Record<string, unknown>, key: string, where: string): number | null {
	const value = obj[key];
	if (value === undefined || value === null) return null;
	const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
	if (!Number.isInteger(n)) {
		throw new Error(`${where}: invalid "${key}" (expected an integer)`);
	}
	return n;
}

/**
 * Normalize the `teams` argument of add_event_teams: a non-empty array of
 * `{ teamId, entry?, status? }`. Entry defaults to "open", status to "active".
 * Duplicate teamIds are rejected (the last write would silently win otherwise).
 */
export function normalizeEventTeams(raw: unknown): NormalizedEventTeam[] {
	const items = asRecordArray(raw, 'teams');
	const seen = new Set<string>();
	return items.map((item, i) => {
		const where = `teams[${i}]`;
		const teamId = requireStringField(item, 'teamId', where);
		if (seen.has(teamId)) throw new Error(`${where}: duplicate teamId "${teamId}"`);
		seen.add(teamId);
		return {
			teamId,
			entry: optionalEnumField(item, 'entry', EVENT_TEAM_ENTRIES, 'open', where),
			status: optionalEnumField(item, 'status', EVENT_TEAM_STATUSES, 'active', where)
		};
	});
}

/**
 * Normalize the `results` argument of set_event_results: a non-empty array of
 * `{ teamId, rank, rankTo?, prizeAmount?, prizeCurrency? }`. Rank must be a
 * positive integer; rankTo (for shared placements like "5–8") must be >= rank.
 */
export function normalizeEventResults(raw: unknown): NormalizedEventResult[] {
	const items = asRecordArray(raw, 'results');
	const seen = new Set<string>();
	return items.map((item, i) => {
		const where = `results[${i}]`;
		const teamId = requireStringField(item, 'teamId', where);
		if (seen.has(teamId)) throw new Error(`${where}: duplicate teamId "${teamId}"`);
		seen.add(teamId);

		const rank = requireIntField(item, 'rank', where);
		if (rank < 1) throw new Error(`${where}: "rank" must be >= 1`);

		const rankTo = optionalIntField(item, 'rankTo', where);
		if (rankTo !== null && rankTo < rank) {
			throw new Error(`${where}: "rankTo" (${rankTo}) must be >= "rank" (${rank})`);
		}

		const prizeAmount = optionalIntField(item, 'prizeAmount', where);
		if (prizeAmount !== null && prizeAmount < 0) {
			throw new Error(`${where}: "prizeAmount" must be >= 0`);
		}

		const prizeCurrencyRaw = item.prizeCurrency;
		const prizeCurrency =
			prizeCurrencyRaw === undefined || prizeCurrencyRaw === null
				? null
				: requireStringField(item, 'prizeCurrency', where);

		return { teamId, rank, rankTo, prizeAmount, prizeCurrency };
	});
}
