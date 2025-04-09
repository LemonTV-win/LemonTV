import type { PageLoad } from './$types';

import { getPlayer, getPlayerTeams, getPlayerEvents } from '$lib/data';

export const load: PageLoad = ({ params }) => {
	return {
		player: getPlayer(params.id),
		playerTeams: getPlayerTeams(params.id),
		playerEvents: getPlayerEvents(params.id)
	};
};
