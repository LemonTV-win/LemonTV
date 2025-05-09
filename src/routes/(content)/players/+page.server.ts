import type { PageServerLoad } from './$types';
import {
	getPlayers,
	getPlayersTeams,
	getPlayersAgents,
	calculatePlayerRating,
	getPlayerWins
} from '$lib/server/data/players';

export const load: PageServerLoad = async ({ locals: { user } }) => {
	const players = await getPlayers();

	const playersTeams = await getPlayersTeams();
	const playersAgents = getPlayersAgents(players);

	return {
		players: players.map((player) => ({
			...player,
			wins: getPlayerWins(player.slug ?? player.name),
			rating: calculatePlayerRating(player)
		})),
		playersAgents,
		playersTeams,
		user
	};
};
