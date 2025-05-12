import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params, locals }) => {
	const { id } = params;

	try {
		// Get the edit history records
		const history = await db
			.select({
				id: table.editHistory.id,
				tableName: table.editHistory.tableName,
				recordId: table.editHistory.recordId,
				fieldName: table.editHistory.fieldName,
				oldValue: table.editHistory.oldValue,
				newValue: table.editHistory.newValue,
				editedAt: table.editHistory.editedAt,
				editedBy: table.editHistory.editedBy
			})
			.from(table.editHistory)
			.where(and(eq(table.editHistory.tableName, 'event'), eq(table.editHistory.recordId, id)))
			.orderBy(table.editHistory.editedAt);

		// Get editor information for each record
		const editorIds = [...new Set(history.map((h) => h.editedBy))];
		const editors = await db
			.select({
				id: table.user.id,
				name: table.user.username,
				email: table.user.email
			})
			.from(table.user)
			.where(inArray(table.user.id, editorIds));

		// Create a map of editor information
		const editorMap = new Map(editors.map((e) => [e.id, e]));

		// Combine history with editor information
		const historyWithEditors = history.map((record) => ({
			...record,
			editor: editorMap.get(record.editedBy)
		}));

		return json(historyWithEditors);
	} catch (error) {
		console.error('Error fetching event history:', error);
		return json({ error: 'Failed to fetch event history' }, { status: 500 });
	}
};
