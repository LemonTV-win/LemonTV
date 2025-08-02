import type { PageServerLoad } from './$types';
import type { Team } from '$lib/data/teams';
import type { Player } from '$lib/data/players';
import { getTeams, getServerTeamWins } from '$lib/server/data/teams';
import { calculatePlayerRating } from '$lib/server/data/players';
import { processImageURL } from '$lib/server/storage';

export const load: PageServerLoad = async ({ url }) => {
	const teams = await getTeams();
	const search = url.searchParams.get('search') || '';

	// Collect unique logo URLs
	const uniqueLogoUrls = new Set<string>();
	for (const team of teams) {
		if (team.logo) {
			uniqueLogoUrls.add(team.logo);
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

	// Apply processed URLs to teams and calculate wins
	const teamsWithLogos = (await Promise.all(
		teams.map(async (team) => ({
			...team,
			logoURL: team.logo ? logoUrlMap.get(team.logo) || null : null,
			wins: await getServerTeamWins(team.id),
			players: team.players?.map((player) => ({
				...player,
				rating: calculatePlayerRating(player)
			}))
		}))
	)) as (Team & {
		wins: number;
		players: (Player & { rating: number })[];
		logoURL: string | null;
	})[];

	return {
		teams: teamsWithLogos,
		search
	};
};
