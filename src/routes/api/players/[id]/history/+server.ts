import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPlayerEditHistory } from '$lib/server/data/players';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schemas/auth';
import { inArray } from 'drizzle-orm';

/**
 * @swagger
 * /api/players/{id}/history:
 *   get:
 *     summary: Get edit history for a player
 *     description: Retrieves the edit history for a specific player. Requires admin or editor role.
 *     tags: [Players]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Player ID or slug
 *     responses:
 *       200:
 *         description: Edit history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   editedBy:
 *                     type: string
 *                   editedAt:
 *                     type: string
 *                     format: date-time
 *                   editor:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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
		console.error('Error fetching player edit history:', error);
		return json({ error: 'Failed to fetch edit history' }, { status: 500 });
	}
};
