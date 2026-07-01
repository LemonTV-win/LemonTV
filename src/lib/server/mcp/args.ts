/**
 * Argument validation helpers for MCP tools.
 *
 * MCP `inputSchema.required` is advertised to clients but NOT enforced by the
 * dispatcher, so tool handlers must validate required arguments themselves.
 * Kept free of DB/SvelteKit imports so it is unit-testable in isolation.
 */

/**
 * Read a required string argument, rejecting missing/blank/non-string values.
 * Without this, an omitted field would coerce (`String(undefined)`) to the
 * literal "undefined" and slip past the data layer's truthiness checks.
 */
export function requireString(args: Record<string, unknown>, key: string): string {
	const value = args[key];
	if (typeof value !== 'string' || value.trim() === '') {
		throw new Error(`Missing or invalid required field: ${key}`);
	}
	return value;
}

/**
 * Read a required integer argument. Accepts a number or a numeric string and
 * rejects missing/null/NaN/non-integer values — without this, `Number(null)`
 * would coerce to `0` and create a corrupt record (game accounts are keyed by
 * account id).
 */
export function requireInt(args: Record<string, unknown>, key: string): number {
	const value = args[key];
	const n =
		typeof value === 'number'
			? value
			: typeof value === 'string' && value.trim() !== ''
				? Number(value)
				: NaN;
	if (!Number.isFinite(n) || !Number.isInteger(n)) {
		throw new Error(`Missing or invalid required field: ${key} (expected an integer)`);
	}
	return n;
}

/**
 * Read an optional integer argument. Accepts a number or numeric string, returns
 * `defaultValue` when absent/null/blank, and rejects non-integers. Use `min`
 * for fields such as capacity where negative numbers are never meaningful.
 */
export function optionalInt(
	args: Record<string, unknown>,
	key: string,
	defaultValue: number,
	options: { min?: number } = {}
): number {
	const value = args[key];
	if (value === undefined || value === null || value === '') return defaultValue;
	const n = requireInt(args, key);
	if (options.min !== undefined && n < options.min) {
		throw new Error(`Invalid ${key}: expected an integer >= ${options.min}`);
	}
	return n;
}

/**
 * Read an optional boolean argument. Besides true booleans, accepts the common
 * string/number forms produced by loosely-typed MCP clients. Importantly,
 * `"false"` is false (not truthy), avoiding accidental official-event flips.
 */
export function optionalBoolean(
	args: Record<string, unknown>,
	key: string,
	defaultValue = false
): boolean {
	const value = args[key];
	if (value === undefined || value === null || value === '') return defaultValue;
	if (typeof value === 'boolean') return value;
	if (typeof value === 'number') {
		if (value === 1) return true;
		if (value === 0) return false;
	}
	if (typeof value === 'string') {
		const normalized = value.trim().toLowerCase();
		if (['true', '1', 'yes', 'y'].includes(normalized)) return true;
		if (['false', '0', 'no', 'n'].includes(normalized)) return false;
	}
	throw new Error(`Invalid ${key}: expected a boolean`);
}

/**
 * Validate an optional enum argument. Returns `undefined` when absent, the value
 * when it's one of `allowed`, and throws otherwise — the data layer stores these
 * as plain text without validating, so the tool must.
 */
export function optionalEnum<T extends string>(
	value: unknown,
	allowed: readonly T[],
	field: string
): T | undefined {
	if (value === undefined || value === null) return undefined;
	if (typeof value === 'string' && (allowed as readonly string[]).includes(value)) {
		return value as T;
	}
	throw new Error(`Invalid ${field}: expected one of ${allowed.join(', ')}`);
}

/**
 * Validate a required enum argument — throws when absent or not in `allowed`
 * (never silently defaults), so a missing/misspelled value surfaces as a bad
 * request instead of being coerced to a wrong-but-valid option.
 */
export function requireEnum<T extends string>(
	value: unknown,
	allowed: readonly T[],
	field: string
): T {
	if (typeof value === 'string' && (allowed as readonly string[]).includes(value)) {
		return value as T;
	}
	throw new Error(
		`Missing or invalid required field: ${field} (expected one of ${allowed.join(', ')})`
	);
}
