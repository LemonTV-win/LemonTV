import type { PageServerLoad } from './$types';
import {
	getPlayers,
	getPlayersTeams,
	getPlayersAgents,
	calculatePlayerRating,
	getPlayerWins,
	calculatePlayerKD
} from '$lib/server/data/players';
import { count, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

async function getServerPlayerEventsCountOnly(id: string): Promise<number> {
	return await db
		.select({
			count: count()
		})
		.from(table.eventTeamPlayer)
		.innerJoin(table.event, eq(table.eventTeamPlayer.eventId, table.event.id))
		.where(eq(table.eventTeamPlayer.playerId, id))
		.then((result) => result[0].count);
}

export const load: PageServerLoad = async ({ locals: { user } }) => {
	const players = await getPlayers();

	const playersTeams = await getPlayersTeams();
	const playersAgents = getPlayersAgents(players);

	return {
		players: await Promise.all(
			players.map(async (player) => ({
				...player,
				wins: getPlayerWins(player.slug ?? player.name),
				rating: calculatePlayerRating(player),
				kd: calculatePlayerKD(player),
				eventsCount: await getServerPlayerEventsCountOnly(player.id)
			}))
		),
		playersAgents,
		playersTeams,
		user
	};
};
