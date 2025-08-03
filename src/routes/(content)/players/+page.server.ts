import type { PageServerLoad } from './$types';
import {
	getPlayers,
	getPlayersTeams,
	getServerPlayersAgents,
	getAllPlayersEssentialStats,
	getAllPlayersSuperstringPower
} from '$lib/server/data/players';
import { CHARACTERS } from '$lib/data/game';
import { processImageURL } from '$lib/server/storage';

export const load: PageServerLoad = async ({ locals: { user } }) => {
	const players = await getPlayers();
	const playersTeams = await getPlayersTeams();

	// Get essential stats for all players (optimized)
	const playersEssentialStats = await getAllPlayersEssentialStats();

	// Get server-side agents for all players (optimized)
	const playerIds = players.map((p) => p.id);
	const playersAgents = await getServerPlayersAgents(playerIds, 0);

	// Get Superstring Power for all characters
	const superstringPowerData: Record<
		string,
		{ playerId: string; power: number; gamesPlayed: number; wins: number }[]
	> = {};

	for (const character of CHARACTERS) {
		superstringPowerData[character] = await getAllPlayersSuperstringPower(character);
	}

	// Collect unique avatar URLs
	const uniqueAvatarUrls = new Set<string>();
	for (const player of players) {
		if (player.avatar) {
			uniqueAvatarUrls.add(player.avatar);
		}
	}

	// Process all avatar URLs in parallel
	const avatarUrlMap = new Map<string, string>();
	await Promise.all(
		Array.from(uniqueAvatarUrls).map(async (url) => {
			const processed = await processImageURL(url);
			avatarUrlMap.set(url, processed);
		})
	);

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
				avatarURL: player.avatar ? avatarUrlMap.get(player.avatar) || null : null,
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
