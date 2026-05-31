/**
 * Token-bucket rate limiting — pure core.
 *
 * No DB/SvelteKit imports, so it is unit-testable in isolation. The persisted
 * per-token state lives in `mcp_rate_limit`; the DB-backed `consumeRateLimit`
 * (in `./hooks`) reads/writes a row and applies these functions.
 */
export interface BucketConfig {
	/** Maximum tokens the bucket holds (the burst allowance). */
	capacity: number;
	/** Tokens replenished per second (the sustained rate). */
	refillPerSecond: number;
}

export interface BucketState {
	tokens: number;
	updatedAtMs: number;
}

export interface ConsumeResult {
	allowed: boolean;
	/** Tokens remaining after this attempt (post-refill, post-decrement if allowed). */
	tokens: number;
	/** Seconds until the next token is available (0 when allowed). */
	retryAfterSeconds: number;
}

/** Default: burst of 120 requests, sustained 2 requests/second per token. */
export const DEFAULT_BUCKET: BucketConfig = { capacity: 120, refillPerSecond: 2 };

/** Tokens available now, after replenishing for elapsed time (capped at capacity). */
export function refilledTokens(state: BucketState, nowMs: number, config: BucketConfig): number {
	const elapsedSeconds = Math.max(0, (nowMs - state.updatedAtMs) / 1000);
	return Math.min(config.capacity, state.tokens + elapsedSeconds * config.refillPerSecond);
}

/** Attempt to consume one token. Pure — returns the next state without persisting. */
export function consumeToken(
	state: BucketState,
	nowMs: number,
	config: BucketConfig = DEFAULT_BUCKET
): ConsumeResult {
	const tokens = refilledTokens(state, nowMs, config);
	if (tokens >= 1) {
		return { allowed: true, tokens: tokens - 1, retryAfterSeconds: 0 };
	}
	const deficit = 1 - tokens;
	return { allowed: false, tokens, retryAfterSeconds: deficit / config.refillPerSecond };
}

/** A fresh, full bucket. */
export function initialBucket(nowMs: number, config: BucketConfig = DEFAULT_BUCKET): BucketState {
	return { tokens: config.capacity, updatedAtMs: nowMs };
}
