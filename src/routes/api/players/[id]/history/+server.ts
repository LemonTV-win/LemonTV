import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPlayerEditHistory } from '$lib/server/data/players';

export const GET: RequestHandler = async ({ params, locals }) => {
	// Check if user is authenticated and has appropriate role
	if (
		!locals.user ||
		!['admin', 'editor'].some((role) => (locals.user as { roles: string[] }).roles.includes(role))
	) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const history = await getPlayerEditHistory(params.id);
		return json(history);
	} catch (error) {
		console.error('Error fetching player edit history:', error);
		return json({ error: 'Failed to fetch edit history' }, { status: 500 });
	}
};
