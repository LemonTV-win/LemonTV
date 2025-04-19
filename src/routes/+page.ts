import type { PageLoad } from './$types';
import { getEvents, getTeams, getPlayers, getPlayersTeams } from '$lib/data';

export const load: PageLoad = () => {
	const playersTeams = getPlayersTeams();
	return {
		events: getEvents(),
		teams: getTeams(),
		players: getPlayers().map((player) => ({
			...player,
			teams:
				playersTeams[player.id ?? '']?.map((team) => team?.name ?? undefined).filter(Boolean) ?? []
		}))
	};
};
