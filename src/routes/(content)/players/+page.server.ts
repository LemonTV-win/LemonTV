import type { PageServerLoad } from './$types';
import {
	getPlayers,
	getPlayersTeams,
	getPlayersAgents,
	getAllPlayersEssentialStats
} from '$lib/server/data/players';

export const load: PageServerLoad = async ({ locals: { user } }) => {
	const players = await getPlayers();
	const playersTeams = await getPlayersTeams();
	const playersAgents = getPlayersAgents(players);

	// Get essential stats for all players (optimized)
	const playersEssentialStats = await getAllPlayersEssentialStats();

	// Create a map for quick lookup
	const statsByPlayerId = new Map(playersEssentialStats.map((stats) => [stats.playerId, stats]));

	return {
		players: players.map((player) => {
			const stats = statsByPlayerId.get(player.id) || {
				wins: 0,
				rating: 0,
				kd: 0,
				eventsCount: 0
			};

			return {
				...player,
				wins: stats.wins,
				rating: stats.rating,
				kd: stats.kd,
				eventsCount: stats.eventsCount
			};
		}),
		playersAgents,
		playersTeams,
		user
	};
};
