import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function GET({ params }) {
	const { id } = params;

	try {
		const teamPlayers = await db
			.select()
			.from(table.eventTeamPlayer)
			.where(eq(table.eventTeamPlayer.eventId, id));

		return json(teamPlayers);
	} catch (e) {
		console.error('[API][Events][TeamPlayers] Failed to fetch team players:', e);
		return json({ error: 'Failed to fetch team players' }, { status: 500 });
	}
}
