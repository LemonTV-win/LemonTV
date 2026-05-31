import { describe, it, expect } from 'bun:test';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { sql } from 'drizzle-orm';
import { captureRows, insertRows, type SqlExecutor } from './archive-core';

async function freshDb() {
	const db = drizzle(createClient({ url: ':memory:' }));
	await db.run(
		sql`CREATE TABLE thing (id text primary key, name text, created_at integer, score real, note text)`
	);
	return db as unknown as SqlExecutor & { run: (q: ReturnType<typeof sql>) => Promise<unknown> };
}

describe('archive-core capture/restore round-trip', () => {
	it('restores a row with timestamp, float, and null verbatim through a JSON cycle', async () => {
		const db = await freshDb();
		await db.run(
			sql`INSERT INTO thing (id, name, created_at, score, note) VALUES ('a', 'Alice', 1780000000000, 1.5, NULL)`
		);

		const rows = await captureRows(db, 'thing', 'id', 'a');
		expect(rows).toHaveLength(1);

		// Simulate the JSON archive round-trip and the hard delete.
		const archived = JSON.parse(JSON.stringify(rows)) as Record<string, unknown>[];
		await db.run(sql`DELETE FROM thing WHERE id = 'a'`);
		expect(await captureRows(db, 'thing', 'id', 'a')).toHaveLength(0);

		await insertRows(db, 'thing', archived);

		const after = await captureRows(db, 'thing', 'id', 'a');
		expect(after).toHaveLength(1);
		expect(after[0]).toEqual({
			id: 'a',
			name: 'Alice',
			created_at: 1780000000000,
			score: 1.5,
			note: null
		});
	});

	it('captures and restores multiple child rows', async () => {
		const db = await freshDb();
		await db.run(sql`CREATE TABLE child (id integer primary key, thing_id text, alias text)`);
		await db.run(
			sql`INSERT INTO child (thing_id, alias) VALUES ('t1', 'x'), ('t1', 'y'), ('t2', 'z')`
		);

		const rows = await captureRows(db, 'child', 'thing_id', 't1');
		expect(rows.map((r) => r.alias).sort()).toEqual(['x', 'y']);

		await db.run(sql`DELETE FROM child WHERE thing_id = 't1'`);
		await insertRows(db, 'child', JSON.parse(JSON.stringify(rows)));
		expect((await captureRows(db, 'child', 'thing_id', 't1')).length).toBe(2);
	});

	it('insertRows is a no-op for an empty snapshot', async () => {
		const db = await freshDb();
		await insertRows(db, 'thing', []);
		expect(await captureRows(db, 'thing', 'id', 'nope')).toHaveLength(0);
	});
});
