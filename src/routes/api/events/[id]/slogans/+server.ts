import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params }) => {
	const { id } = params;

	try {
		// Get all team slogans for this event
		const slogans = await db
			.select({
				id: table.teamSlogan.id,
				teamId: table.teamSlogan.teamId,
				eventId: table.teamSlogan.eventId,
				slogan: table.teamSlogan.slogan,
				language: table.teamSlogan.language,
				createdAt: table.teamSlogan.createdAt,
				updatedAt: table.teamSlogan.updatedAt
			})
			.from(table.teamSlogan)
			.where(eq(table.teamSlogan.eventId, id));

		console.info('[API][Events][Slogans] Slogans:', slogans);

		return json(slogans);
	} catch (e) {
		console.error('[API][Events][Slogans] Failed to fetch team slogans:', e);
		return json({ error: 'Failed to fetch team slogans' }, { status: 500 });
	}
};
