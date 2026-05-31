/**
 * Same-origin path guard — pure. Prevents the login `?redirect=` parameter from
 * being abused as an open redirect (e.g. `?redirect=https://evil.example`). Only
 * a path on our OWN origin is allowed; anything else falls back to `/`.
 *
 * This matters more now that `/login?redirect=/oauth/authorize?…` is the gateway
 * into the OAuth authorization flow.
 */

/** True if the string contains any C0 control char (NUL..US) — header-splitting guard. */
function hasControlChar(value: string): boolean {
	for (let i = 0; i < value.length; i++) {
		if (value.charCodeAt(i) < 0x20) return true;
	}
	return false;
}

export function safeInternalPath(value: string | null | undefined, fallback = '/'): string {
	if (!value) return fallback;
	// Must be an absolute path on this origin: a single leading slash.
	if (value[0] !== '/') return fallback;
	// Reject protocol-relative ("//host") and backslash tricks ("/\\host") that
	// browsers may treat as a new origin.
	if (value[1] === '/' || value[1] === '\\') return fallback;
	if (hasControlChar(value)) return fallback;
	return value;
}
