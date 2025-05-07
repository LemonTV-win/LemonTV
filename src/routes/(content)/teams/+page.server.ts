import type { PageServerLoad } from './$types';
import { getTeams, type CompiledTeam } from '$lib/data';
import { getPlayer } from '$lib/server/data/players';

export const load: PageServerLoad = () => {
	return {
		teams: getTeams().map((team) => ({
			...team,
			players: team.players?.map((player) => getPlayer(player)),
			substitutes: team.substitutes?.map((player) => getPlayer(player)),
			former: team.former?.map((player) => getPlayer(player))
		})) as (CompiledTeam & { wins: number })[]
	};
};
