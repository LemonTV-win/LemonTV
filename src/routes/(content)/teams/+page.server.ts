import type { PageServerLoad } from './$types';
import { getTeams, type CompiledTeam } from '$lib/data';
import { getPlayer, getPlayers } from '$lib/server/data/players';

export const load: PageServerLoad = async () => {
	const players = await getPlayers();
	return {
		teams: getTeams().map((team) => ({
			...team,
			players: team.players?.map((player) => players.find((p) => p.slug === player)),
			substitutes: team.substitutes?.map((player) => players.find((p) => p.slug === player)),
			former: team.former?.map((player) => players.find((p) => p.slug === player))
		})) as (CompiledTeam & { wins: number })[]
	};
};
