import { describe, it, expect } from 'bun:test';
import {
	consumeToken,
	refilledTokens,
	initialBucket,
	DEFAULT_BUCKET,
	type BucketConfig
} from './rate-limit';

const CFG: BucketConfig = { capacity: 10, refillPerSecond: 1 };
const T0 = 1_000_000;

describe('refilledTokens', () => {
	it('replenishes by elapsed time at the refill rate', () => {
		// 2 tokens, +5s at 1/s => 7
		expect(refilledTokens({ tokens: 2, updatedAtMs: T0 }, T0 + 5000, CFG)).toBe(7);
	});

	it('never exceeds capacity', () => {
		expect(refilledTokens({ tokens: 8, updatedAtMs: T0 }, T0 + 60_000, CFG)).toBe(CFG.capacity);
	});

	it('treats clock going backwards as zero elapsed', () => {
		expect(refilledTokens({ tokens: 4, updatedAtMs: T0 }, T0 - 5000, CFG)).toBe(4);
	});
});

describe('consumeToken', () => {
	it('allows and decrements when tokens are available', () => {
		const r = consumeToken({ tokens: 3, updatedAtMs: T0 }, T0, CFG);
		expect(r.allowed).toBe(true);
		expect(r.tokens).toBe(2);
		expect(r.retryAfterSeconds).toBe(0);
	});

	it('denies when the bucket is empty and reports retry-after', () => {
		const r = consumeToken({ tokens: 0, updatedAtMs: T0 }, T0, CFG);
		expect(r.allowed).toBe(false);
		expect(r.tokens).toBe(0);
		// need 1 token at 1/s => 1s
		expect(r.retryAfterSeconds).toBe(1);
	});

	it('allows again once enough time has elapsed to refill', () => {
		const empty = { tokens: 0, updatedAtMs: T0 };
		expect(consumeToken(empty, T0 + 500, CFG).allowed).toBe(false); // 0.5 tokens
		expect(consumeToken(empty, T0 + 1000, CFG).allowed).toBe(true); // 1 token
	});

	it('a fresh bucket permits a full burst then denies', () => {
		let state = initialBucket(T0, CFG);
		let allowed = 0;
		for (let i = 0; i < CFG.capacity + 3; i++) {
			const r = consumeToken(state, T0, CFG);
			if (r.allowed) allowed++;
			state = { tokens: r.tokens, updatedAtMs: T0 };
		}
		expect(allowed).toBe(CFG.capacity);
	});

	it('uses the default bucket config when none is passed', () => {
		const r = consumeToken({ tokens: DEFAULT_BUCKET.capacity, updatedAtMs: T0 }, T0);
		expect(r.allowed).toBe(true);
		expect(r.tokens).toBe(DEFAULT_BUCKET.capacity - 1);
	});
});
