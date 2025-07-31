import type { PageServerLoad } from './$types';
import {
	getPlayers,
	getPlayersTeams,
	getServerPlayersAgents,
	getAllPlayersEssentialStats,
	getAllPlayersSuperstringPower
} from '$lib/server/data/players';
import { CHARACTERS } from '$lib/data/game';

export const load: PageServerLoad = async ({ locals: { user } }) => {
	const players = await getPlayers();
	const playersTeams = await getPlayersTeams();

	// Get essential stats for all players (optimized)
	const playersEssentialStats = await getAllPlayersEssentialStats();

	// Get server-side agents for all players (optimized)
	const playerIds = players.map((p) => p.id);
	const playersAgents = await getServerPlayersAgents(playerIds, 3);

	// Get Superstring Power for all characters
	const superstringPowerData: Record<
		string,
		{ playerId: string; power: number; gamesPlayed: number; wins: number }[]
	> = {};

	for (const character of CHARACTERS) {
		superstringPowerData[character] = await getAllPlayersSuperstringPower(character);
	}

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
		superstringPowerData,
		user
	};
};
