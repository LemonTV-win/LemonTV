import type { PageServerLoad } from './$types';
import type { Team } from '$lib/data/teams';
import type { Player } from '$lib/data/players';
import { getTeams, getTeamWins } from '$lib/server/data/teams';
import { calculatePlayerRating } from '$lib/server/data/players';

export const load: PageServerLoad = async ({ url }) => {
	const teams = await getTeams();
	const search = url.searchParams.get('search') || '';

	return {
		teams: teams.map((team) => ({
			...team,
			wins: getTeamWins(team),
			players: team.players?.map((player) => ({
				...player,
				rating: calculatePlayerRating(player)
			}))
		})) as (Team & { wins: number; players: (Player & { rating: number })[] })[],
		search
	};
};
