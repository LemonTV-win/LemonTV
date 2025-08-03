import type { PageServerLoad } from './$types';
import type { Team } from '$lib/data/teams';
import type { Player } from '$lib/data/players';
import { getTeams, getServerTeamWins } from '$lib/server/data/teams';
import { getAllPlayersRatings } from '$lib/server/data/players';
import { processImageURL } from '$lib/server/storage';

export const load: PageServerLoad = async ({ url }) => {
	const teams = await getTeams();
	const search = url.searchParams.get('search') || '';

	// Get all player ratings (optimized)
	const allPlayerRatings = await getAllPlayersRatings();
	const ratingsByPlayerId = new Map(
		allPlayerRatings.map((rating) => [rating.playerId, rating.rating])
	);

	// Collect unique logo URLs and player avatar URLs
	const uniqueLogoUrls = new Set<string>();
	const uniqueAvatarUrls = new Set<string>();

	for (const team of teams) {
		if (team.logo) {
			uniqueLogoUrls.add(team.logo);
		}
		// Collect player avatar URLs
		for (const player of team.players || []) {
			if (player.avatar) {
				uniqueAvatarUrls.add(player.avatar);
			}
		}
	}

	// Process all logo URLs in parallel
	const logoUrlMap = new Map<string, string>();
	await Promise.all(
		Array.from(uniqueLogoUrls).map(async (url) => {
			const processed = await processImageURL(url);
			logoUrlMap.set(url, processed);
		})
	);

	// Process all avatar URLs in parallel
	const avatarUrlMap = new Map<string, string>();
	await Promise.all(
		Array.from(uniqueAvatarUrls).map(async (url) => {
			const processed = await processImageURL(url);
			avatarUrlMap.set(url, processed);
		})
	);

	// Apply processed URLs to teams and calculate wins
	const teamsWithLogos = (await Promise.all(
		teams.map(async (team) => ({
			...team,
			logoURL: team.logo ? logoUrlMap.get(team.logo) || null : null,
			wins: await getServerTeamWins(team.id),
			players: team.players?.map((player) => ({
				...player,
				avatarURL: player.avatar ? avatarUrlMap.get(player.avatar) || null : null,
				rating: ratingsByPlayerId.get(player.id) ?? 0
			}))
		}))
	)) as (Team & {
		wins: number;
		players: (Player & { rating: number; avatarURL: string | null })[];
		logoURL: string | null;
	})[];

	return {
		teams: teamsWithLogos,
		search
	};
};
