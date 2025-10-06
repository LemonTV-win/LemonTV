import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import type { Character } from '$lib/data/game';
import { processImageURL } from '$lib/server/storage';
import { buildNationalities } from '$lib/server/data/players';

export const load: PageServerLoad = async () => {
	// Fetch all player character stats from the database
	const allPlayerCharStats = await db.query.playerCharacterStats.findMany();

	// Process the flat list into the nested map structure the component needs
	const superstringPowerData = allPlayerCharStats.reduce(
		(acc, stat) => {
			const char = stat.characterId as Character;
			if (!acc[char]) {
				acc[char] = [];
			}
			acc[char].push({
				playerId: stat.playerId,
				power: stat.superstringPower,
				gamesPlayed: stat.totalGames,
				wins: stat.totalWins
			});
			return acc;
		},
		{} as Record<
			Character,
			{ playerId: string; power: number; gamesPlayed: number; wins: number }[]
		>
	);

	// Fetch all players with their necessary details for the ranking table
	const allPlayers = await db.query.player.findMany({
		columns: {
			id: true,
			name: true,
			slug: true,
			avatar: true,
			nationality: true
		},
		with: {
			teamMemberships: { with: { team: true } },
			additionalNationalities: {
				columns: { nationality: true }
			},
			gameAccounts: {
				columns: {
					currentName: true
				}
			},
			aliases: {
				columns: {
					alias: true
				}
			}
			// Other relations like aliases can be added here if needed
		}
	});

	const uniqueImageUrls = new Map();
	for (const player of allPlayers) {
		if (player.avatar && !uniqueImageUrls.has(player.avatar)) {
			uniqueImageUrls.set(player.avatar, await processImageURL(player.avatar));
		}
	}

	return {
		allPlayers: await Promise.all(
			allPlayers.map(async (player) => ({
				...player,
				nationalities: buildNationalities(player.nationality, player.additionalNationalities),
				avatar: uniqueImageUrls.get(player.avatar),
				teams: player.teamMemberships.map((team) => ({
					id: team.team.id,
					name: team.team.name,
					slug: team.team.slug
				})),
				aliases: player.aliases.map((alias) => alias.alias)
			}))
		),
		superstringPowerData
	};
};
