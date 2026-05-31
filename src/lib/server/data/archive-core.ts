/**
 * Raw row capture/restore for the recoverable-delete archive.
 *
 * Generic over any drizzle SQL executor (db or transaction). Uses `SELECT *` /
 * dynamic `INSERT` with raw column names and verbatim values, so every column
 * (timestamps, nulls, ints, text) round-trips without per-column type handling.
 * Kept free of app DB / SvelteKit imports so it is integration-testable against
 * an in-memory libSQL database.
 */
import { sql, type SQL } from 'drizzle-orm';

export interface SqlExecutor {
	all(query: SQL): Promise<unknown[]>;
	run(query: SQL): Promise<unknown>;
}

/** Snapshot all rows of `tableName` where `columnName` = `value`. */
export async function captureRows(
	executor: SqlExecutor,
	tableName: string,
	columnName: string,
	value: string
): Promise<Record<string, unknown>[]> {
	const rows = await executor.all(
		sql`SELECT * FROM ${sql.identifier(tableName)} WHERE ${sql.identifier(columnName)} = ${value}`
	);
	return rows as Record<string, unknown>[];
}

/** Re-insert previously-captured rows verbatim into `tableName`. */
export async function insertRows(
	executor: SqlExecutor,
	tableName: string,
	rows: Record<string, unknown>[]
): Promise<void> {
	for (const row of rows) {
		const cols = Object.keys(row);
		if (cols.length === 0) continue;
		const colSql = sql.join(
			cols.map((c) => sql.identifier(c)),
			sql.raw(', ')
		);
		const valSql = sql.join(
			cols.map((c) => sql`${row[c]}`),
			sql.raw(', ')
		);
		await executor.run(
			sql`INSERT INTO ${sql.identifier(tableName)} (${colSql}) VALUES (${valSql})`
		);
	}
}
