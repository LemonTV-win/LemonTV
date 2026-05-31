import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { user } from './auth/user';

/**
 * Recoverable-delete archive.
 *
 * Deleting a player/team hard-deletes the row and its related rows (so every
 * read is correct-by-construction — no soft-delete filters needed), but first a
 * full JSON snapshot of the entity and its related rows is stored here. An admin
 * can restore it, re-inserting the rows verbatim. See `$lib/server/data/archive.ts`.
 */
export const deletedRecord = sqliteTable(
	'deleted_record',
	{
		id: text('id').primaryKey(),
		/** Logical entity name, e.g. 'player' | 'team'. */
		entity: text('entity').notNull(),
		recordId: text('record_id').notNull(),
		/** Human-readable label (e.g. the player/team name) for the trash UI. */
		label: text('label'),
		/** JSON: { tables: [{ table, rows }] } captured verbatim (raw column values). */
		data: text('data').notNull(),
		deletedBy: text('deleted_by')
			.notNull()
			.references(() => user.id),
		deletedAt: integer('deleted_at', { mode: 'timestamp' }).notNull()
	},
	(table) => {
		return {
			idx_entity: index('idx_deleted_record_entity').on(table.entity),
			idx_record: index('idx_deleted_record_record').on(table.recordId)
		};
	}
);

export type DeletedRecord = typeof deletedRecord.$inferSelect;
export type NewDeletedRecord = typeof deletedRecord.$inferInsert;

export const deletedRecordRelations = relations(deletedRecord, ({ one }) => ({
	deletedByUser: one(user, {
		fields: [deletedRecord.deletedBy],
		references: [user.id]
	})
}));
