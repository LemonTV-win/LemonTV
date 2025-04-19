import type { PageLoad } from './$types';
import { getEvents, getTeams, getPlayers, getPlayersTeams, getPlayerMatches } from '$lib/data';
import type { Player } from '$lib/data/players';

export const load: PageLoad = () => {
	const playersTeams = getPlayersTeams();
	return {
		events: getEvents(),
		teams: getTeams(),
		players: getPlayers()
			.map((player) => ({
				...player,
				teams:
					playersTeams[player.id ?? '']?.map((team) => team?.name ?? undefined).filter(Boolean) ??
					[]
			}))
			.toSorted((a, b) => b.rating - a.rating)
	};
};
