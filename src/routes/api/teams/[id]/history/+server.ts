import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getTeamEditHistory } from '$lib/server/data/teams';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schemas/auth';
import { inArray } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params, locals }) => {
	// Check if user is authenticated and has appropriate role
	if (
		!locals.user ||
		!['admin', 'editor'].some((role) => (locals.user as { roles: string[] }).roles.includes(role))
	) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const history = await getTeamEditHistory(params.id);

		const editorIds = [...new Set(history.map((entry) => entry.editedBy))];
		const editors = await db
			.select({
				id: user.id,
				name: user.username,
				email: user.email
			})
			.from(user)
			.where(inArray(user.id, editorIds));

		const historyWithEditors = history.map((entry) => ({
			...entry,
			editor: editors.find((editor) => editor.id === entry.editedBy)
		}));

		return json(historyWithEditors);
	} catch (error) {
		console.error('Error fetching team edit history:', error);
		return json({ error: 'Failed to fetch edit history' }, { status: 500 });
	}
};
