/**
 * Recoverable delete via a JSON archive.
 *
 * Deleting a player/team still hard-deletes the rows (so every read is
 * correct-by-construction — no soft-delete filters to maintain), but first a
 * verbatim snapshot of the entity + its related rows is captured into
 * `deleted_record`. `restoreEntity` re-inserts those rows exactly. Capture and
 * restore use raw SQL (column names + values verbatim) so timestamps and any
 * column round-trip without per-column type handling.
 */
import { randomUUID } from 'node:crypto';
import { and, desc, eq, getTableName } from 'drizzle-orm';
import type { SQLiteTable, AnySQLiteColumn } from 'drizzle-orm/sqlite-core';
import { db } from '../db';
import * as schema from '$lib/server/db/schema';
import { captureRows, insertRows, type SqlExecutor } from './archive-core';

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

interface ArchiveTable {
	table: SQLiteTable;
	/** Column to match `recordId` on (the entity's own id, or a child FK). */
	column: AnySQLiteColumn;
}

/**
 * Per-entity tables to snapshot, parent first (restore inserts in this order).
 * Must include every table the corresponding delete removes (directly or via
 * cascade) so restore is complete.
 */
const ARCHIVE_CONFIG: Record<string, ArchiveTable[]> = {
	player: [
		{ table: schema.player, column: schema.player.id },
		{ table: schema.playerAlias, column: schema.playerAlias.playerId },
		{ table: schema.gameAccount, column: schema.gameAccount.playerId },
		{ table: schema.player_social_account, column: schema.player_social_account.playerId },
		{
			table: schema.playerAdditionalNationality,
			column: schema.playerAdditionalNationality.playerId
		}
	],
	team: [
		{ table: schema.team, column: schema.team.id },
		{ table: schema.teamAlias, column: schema.teamAlias.teamId },
		{ table: schema.teamPlayer, column: schema.teamPlayer.teamId },
		{ table: schema.teamSlogan, column: schema.teamSlogan.teamId }
	]
};

export const ARCHIVABLE_ENTITIES = Object.keys(ARCHIVE_CONFIG);

interface TableSnapshot {
	table: string;
	rows: Record<string, unknown>[];
}

/**
 * Snapshot an entity (+ related rows) into `deleted_record`. Call inside the
 * delete transaction, BEFORE the hard-deletes.
 */
export async function archiveEntity(
	tx: Tx,
	entity: string,
	recordId: string,
	deletedBy: string,
	label: string | null
): Promise<void> {
	const config = ARCHIVE_CONFIG[entity];
	if (!config) throw new Error(`No archive config for entity: ${entity}`);

	const tables: TableSnapshot[] = [];
	for (const { table, column } of config) {
		const tableName = getTableName(table);
		const rows = await captureRows(tx as SqlExecutor, tableName, column.name, recordId);
		tables.push({ table: tableName, rows });
	}

	await tx.insert(schema.deletedRecord).values({
		id: randomUUID(),
		entity,
		recordId,
		label,
		data: JSON.stringify({ tables }),
		deletedBy,
		deletedAt: new Date()
	});
}

/**
 * Restore a previously archived entity: re-insert its rows verbatim, drop the
 * archive entry, and record a `restoration` edit-history row. Returns false if
 * there is no archive for that record.
 */
export async function restoreEntity(
	entity: string,
	recordId: string,
	restoredBy: string
): Promise<{ restored: boolean }> {
	const [archived] = await db
		.select()
		.from(schema.deletedRecord)
		.where(
			and(eq(schema.deletedRecord.entity, entity), eq(schema.deletedRecord.recordId, recordId))
		)
		.orderBy(desc(schema.deletedRecord.deletedAt))
		.limit(1);

	if (!archived) return { restored: false };

	const snapshot = JSON.parse(archived.data) as { tables: TableSnapshot[] };
	const historyTable = getTableName(ARCHIVE_CONFIG[entity][0].table);

	await db.transaction(async (tx) => {
		for (const { table, rows } of snapshot.tables) {
			await insertRows(tx as SqlExecutor, table, rows);
		}

		await tx.delete(schema.deletedRecord).where(eq(schema.deletedRecord.id, archived.id));
		await tx.insert(schema.editHistory).values({
			id: randomUUID(),
			tableName: historyTable,
			recordId,
			fieldName: 'restoration',
			oldValue: 'deleted',
			newValue: 'restored',
			editedBy: restoredBy,
			editedAt: new Date()
		});
	});

	return { restored: true };
}

/** Trash list for the admin UI (newest first, without the heavy `data` blob). */
export async function listDeletedRecords() {
	return db
		.select({
			id: schema.deletedRecord.id,
			entity: schema.deletedRecord.entity,
			recordId: schema.deletedRecord.recordId,
			label: schema.deletedRecord.label,
			deletedAt: schema.deletedRecord.deletedAt,
			deletedByName: schema.user.username
		})
		.from(schema.deletedRecord)
		.leftJoin(schema.user, eq(schema.deletedRecord.deletedBy, schema.user.id))
		.orderBy(desc(schema.deletedRecord.deletedAt));
}
