import type { PageServerLoad } from './$types';
import type { Team, TeamPlayer } from '$lib/data/teams';
import { getTeams, getAllTeamsWins } from '$lib/server/data/teams';
import { getPlayersRatingsByIds } from '$lib/server/data/players';
import { processImageURL } from '$lib/server/storage';

export const load: PageServerLoad = async ({ url }) => {
	const teams = await getTeams();
	const search = url.searchParams.get('search') || '';

	// Get ratings only for players present on this page
	const playerIds = Array.from(
		new Set(teams.flatMap((team) => (team.players || []).map((tp) => tp.player.id).filter(Boolean)))
	);
	const scopedRatings = await getPlayersRatingsByIds(playerIds);
	const ratingsByPlayerId = new Map(scopedRatings.map((r) => [r.playerId, r.rating]));

	// Collect unique logo URLs and player avatar URLs
	const uniqueLogoUrls = new Set<string>();
	const uniqueAvatarUrls = new Set<string>();

	for (const team of teams) {
		if (team.logo) {
			uniqueLogoUrls.add(team.logo);
		}
		// Collect player avatar URLs
		for (const teamPlayer of team.players || []) {
			if (teamPlayer.player.avatar) {
				uniqueAvatarUrls.add(teamPlayer.player.avatar);
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

	// Fetch all team wins in a single batch
	const allTeamWins = await getAllTeamsWins();

	// Apply processed URLs to teams and attach wins
	const teamsWithLogos = teams.map((team) => ({
		...team,
		logoURL: team.logo ? logoUrlMap.get(team.logo) || null : null,
		wins: allTeamWins[team.id] ?? 0,
		players: team.players?.map((teamPlayer) => ({
			...teamPlayer,
			avatarURL: teamPlayer.player.avatar
				? avatarUrlMap.get(teamPlayer.player.avatar) || null
				: null,
			rating: ratingsByPlayerId.get(teamPlayer.player.id) ?? 0
		}))
	})) as (Team & {
		wins: number;
		players: (TeamPlayer & { rating: number; avatarURL: string | null })[];
		logoURL: string | null;
	})[];

	return {
		teams: teamsWithLogos,
		search
	};
};
