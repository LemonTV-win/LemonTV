import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function GET({ params }) {
	const { id } = params;

	try {
		const teams = await db.select().from(table.eventTeam).where(eq(table.eventTeam.eventId, id));

		return json(teams);
	} catch (e) {
		console.error('[API][Events][Teams] Failed to fetch event teams:', e);
		return json({ error: 'Failed to fetch event teams' }, { status: 500 });
	}
}
