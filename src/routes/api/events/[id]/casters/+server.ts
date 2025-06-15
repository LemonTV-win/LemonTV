import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params }) => {
	const { id } = params;

	// Get all casters for this event
	const casters = await db
		.select({
			playerId: table.eventCaster.playerId,
			role: table.eventCaster.role,
			player: table.player
		})
		.from(table.eventCaster)
		.leftJoin(table.player, eq(table.player.id, table.eventCaster.playerId))
		.where(eq(table.eventCaster.eventId, id));

	return json(casters);
};
