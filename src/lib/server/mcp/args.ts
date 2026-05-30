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
