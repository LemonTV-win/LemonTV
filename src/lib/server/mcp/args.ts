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
