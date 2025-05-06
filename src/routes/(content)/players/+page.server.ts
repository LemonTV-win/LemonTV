import type { PageServerLoad } from './$types';
import {
	getPlayers,
	getPlayersTeams,
	getPlayersAgents,
	calculatePlayerRating
} from '$lib/server/data/players';
import { getPlayerWins } from '$lib/data';

export const load: PageServerLoad = async () => {
	const players = await getPlayers();

	const playersTeams = getPlayersTeams(players);
	const playersAgents = getPlayersAgents(players);

	return {
		players: players.map((player) => ({
			...player,
			wins: getPlayerWins(player.slug ?? player.name),
			rating: calculatePlayerRating(player)
		})),
		playersAgents,
		playersTeams
	};
};
