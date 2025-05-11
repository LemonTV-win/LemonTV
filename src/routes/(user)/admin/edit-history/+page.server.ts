import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { editHistory } from '$lib/server/db/schemas/edit-history';
import { user } from '$lib/server/db/schemas/auth/user';
import { eq, and, like, desc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ url }) => {
	const tableName = url.searchParams.get('tableName');
	const recordId = url.searchParams.get('recordId');
	const fieldName = url.searchParams.get('fieldName');
	const editedBy = url.searchParams.get('editedBy');
	const page = Number(url.searchParams.get('page')) || 1;
	const limit = 50;
	const offset = (page - 1) * limit;

	const conditions = [];
	if (tableName) {
		conditions.push(like(editHistory.tableName, `%${tableName}%`));
	}
	if (recordId) {
		conditions.push(like(editHistory.recordId, `%${recordId}%`));
	}
	if (fieldName) {
		conditions.push(like(editHistory.fieldName, `%${fieldName}%`));
	}

	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

	// First get all records to apply the editedBy filter
	const allRecords = await db
		.select({
			editHistory,
			editor: {
				id: user.id,
				username: user.username,
				email: user.email
			}
		})
		.from(editHistory)
		.leftJoin(user, eq(editHistory.editedBy, user.id))
		.where(whereClause)
		.orderBy(desc(editHistory.editedAt));

	// Apply the editedBy filter if present
	const filteredRecords = editedBy
		? allRecords.filter((record) =>
				record.editor?.username.toLowerCase().includes(editedBy.toLowerCase())
			)
		: allRecords;

	// Calculate total count after filtering
	const totalCount = filteredRecords.length;

	// Apply pagination to filtered results
	const paginatedRecords = filteredRecords.slice(offset, offset + limit);

	const users = await db
		.select({
			id: user.id,
			username: user.username,
			email: user.email
		})
		.from(user);

	return {
		records: paginatedRecords,
		totalCount,
		page,
		limit,
		users,
		filters: {
			tableName,
			recordId,
			fieldName,
			editedBy
		}
	};
};
