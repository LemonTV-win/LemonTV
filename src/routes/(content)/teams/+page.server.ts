import type { PageServerLoad } from './$types';
import type { Team } from '$lib/data/teams';
import { getTeams, getTeamWins } from '$lib/server/data/teams';

export const load: PageServerLoad = async () => {
	const teams = await getTeams();
	return {
		teams: teams.map((team) => ({
			...team,
			wins: getTeamWins(team)
		})) as (Team & { wins: number })[]
	};
};
