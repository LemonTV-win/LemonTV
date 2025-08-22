import type { PageServerLoad } from './$types';
import { getPlayers, getServerPlayersAgents } from '$lib/server/data/players';
import { CHARACTERS } from '$lib/data/game';
import { processImageURL } from '$lib/server/storage';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals: { user } }) => {
	const players = await getPlayers();

	const playersTeams = (
		await db.query.player.findMany({
			columns: {
				id: true
			},
			with: {
				teamMemberships: {
					columns: {
						teamId: true
					},
					with: {
						team: {
							columns: {
								id: true,
								name: true,
								slug: true
							}
						}
					}
				}
			}
		})
	).reduce(
		(acc, player) => {
			acc[player.id] = player.teamMemberships.map(({ team }) => ({
				id: team.id,
				name: team.name,
				slug: team.slug
			}));
			return acc;
		},
		{} as Record<string, { id: string; name: string; slug: string }[]>
	);

	// Get essential stats for all players (optimized)
	const playersEssentialStats = await db.query.playerStats.findMany({
		where: (playerStats, { inArray }) =>
			inArray(
				playerStats.playerId,
				players.map((p) => p.id)
			)
	});

	// Get server-side agents for all players (optimized)
	const playerIds = players.map((p) => p.id);
	const playersAgents = await getServerPlayersAgents(playerIds, 0);

	// Get Superstring Power for all characters
	const superstringPowerData: Record<
		string,
		{ playerId: string; power: number; gamesPlayed: number; wins: number }[]
	> = {};

	for (const character of CHARACTERS) {
		superstringPowerData[character] = await db.query.playerCharacterStats
			.findMany({
				where: (playerCharacterStats, { eq }) => eq(playerCharacterStats.characterId, character)
			})
			.then((stats) => {
				return stats.map((stat) => ({
					playerId: stat.playerId,
					power: stat.superstringPower,
					gamesPlayed: stat.totalGames,
					wins: stat.totalWins
				}));
			});
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
				eventsCount: 0,
				playerRating: 0,
				totalWins: 0,
				averageScore: 0
			};

			return {
				...player,
				avatarURL: player.avatar ? avatarUrlMap.get(player.avatar) || null : null,
				wins: stats.totalWins,
				rating: stats.playerRating,
				kd: stats.kd,
				eventsCount: stats.eventsCount,
				teams: playersTeams[player.id] ?? []
			};
		}),

		playersAgents,
		superstringPowerData,
		user
	};
};
