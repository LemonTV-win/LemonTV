import type { PageLoad } from './$types';

import {
	getPlayer,
	getPlayerTeams,
	getPlayerEvents,
	getPlayerMatches,
	getPlayerWins,
	getPlayerAgents
} from '$lib/data';

export const load: PageLoad = ({ params }) => {
	return {
		player: getPlayer(params.id),
		playerTeams: getPlayerTeams(params.id),
		playerEvents: getPlayerEvents(params.id),
		playerMatches: getPlayerMatches(params.id),
		playerWins: getPlayerWins(params.id),
		playerAgents: getPlayerAgents(getPlayer(params.id))
	};
};
