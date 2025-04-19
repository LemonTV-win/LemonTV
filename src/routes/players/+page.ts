import type { PageLoad } from './$types';
import { getPlayers, getPlayersAgents, getPlayersTeams } from '$lib/data';

export const load: PageLoad = () => {
	return {
		players: getPlayers(),
		playersAgents: getPlayersAgents(),
		playersTeams: getPlayersTeams()
	};
};
