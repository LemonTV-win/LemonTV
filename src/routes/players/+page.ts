import type { PageLoad } from './$types';
import { getPlayers, getPlayersAgents } from '$lib/data';

export const load: PageLoad = () => {
	return {
		players: getPlayers(),
		playersAgents: getPlayersAgents()
	};
};
