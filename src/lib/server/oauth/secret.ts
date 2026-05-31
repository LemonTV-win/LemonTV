/**
 * Opaque-secret generation + hashing for the OAuth flow — pure, no env/DB.
 *
 * Authorization codes and refresh tokens are random opaque strings; only their
 * SHA-256 hash is ever stored (same scheme as the PAT store), so a DB read never
 * yields a usable credential. Client IDs are public, so they are stored as-is.
 */
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding';

/** Refresh tokens carry a recognizable, non-secret prefix (like PATs do). */
export const REFRESH_TOKEN_PREFIX = 'lemon_rt_';

function randomBase64url(bytes: number): string {
	return encodeBase64url(crypto.getRandomValues(new Uint8Array(bytes)));
}

/** A single-use authorization code (opaque, 256 bits). */
export function generateAuthCode(): string {
	return randomBase64url(32);
}

/** A refresh token: prefix + 256 bits of entropy. */
export function generateRefreshToken(): string {
	return `${REFRESH_TOKEN_PREFIX}${randomBase64url(32)}`;
}

/** A public client identifier (128 bits is plenty; it is not a secret). */
export function generateClientId(): string {
	return randomBase64url(16);
}

/** SHA-256 hex digest — what we store and look codes/refresh-tokens up by. */
export function hashSecret(value: string): string {
	return encodeHexLowerCase(sha256(new TextEncoder().encode(value)));
}
