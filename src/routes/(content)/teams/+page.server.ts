import type { PageServerLoad } from './$types';
import type { Team } from '$lib/data/teams';
import type { Player } from '$lib/data/players';
import { getTeams, getTeamWins } from '$lib/server/data/teams';
import { calculatePlayerRating } from '$lib/server/data/players';
import { processImageURL } from '$lib/server/storage';

export const load: PageServerLoad = async ({ url }) => {
	const teams = await getTeams();
	const search = url.searchParams.get('search') || '';

	return {
		teams: (await Promise.all(
			teams.map(async (team) => ({
				...team,
				logoURL: team.logo ? await processImageURL(team.logo) : null,
				wins: getTeamWins(team),
				players: team.players?.map((player) => ({
					...player,
					rating: calculatePlayerRating(player)
				}))
			}))
		)) as (Team & {
			wins: number;
			players: (Player & { rating: number })[];
			logoURL: string | null;
		})[],
		search
	};
};
