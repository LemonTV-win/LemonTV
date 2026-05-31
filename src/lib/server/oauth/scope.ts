/**
 * Scope parsing/validation — pure. Scopes are space-delimited (RFC 6749 §3.3).
 */
import { OAUTH_SCOPES_SUPPORTED, type OAuthScope } from './config';

export function parseScope(raw: string | null | undefined): string[] {
	if (!raw) return [];
	return raw.split(/\s+/).filter(Boolean);
}

export function isSupportedScope(s: string): s is OAuthScope {
	return (OAUTH_SCOPES_SUPPORTED as readonly string[]).includes(s);
}

/** True iff every requested scope is one we support. */
export function allScopesSupported(scopes: string[]): boolean {
	return scopes.every(isSupportedScope);
}

/** True iff `requested` ⊆ `granted` — a refresh may narrow but never widen scope. */
export function isSubsetScope(requested: string[], granted: string[]): boolean {
	const set = new Set(granted);
	return requested.every((s) => set.has(s));
}

export function serializeScope(scopes: string[]): string {
	return scopes.join(' ');
}
