import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
	getPlayer,
	getPlayerTeams,
	getPlayerAgents,
	getSocialPlatforms
} from '$lib/server/data/players';
import { getPlayerEvents, getPlayerMatches, getPlayerWins } from '$lib/data';
export const load: PageServerLoad = async ({ params }) => {
	const player = await getPlayer(params.id);
	if (!player) {
		throw error(404, 'Player not found');
	}

	return {
		player,
		playerTeams: getPlayerTeams(params.id),
		playerEvents: getPlayerEvents(params.id) || getPlayerEvents(player.slug ?? player.name),
		playerMatches: getPlayerMatches(params.id) || getPlayerMatches(player.slug ?? player.name),
		playerWins: getPlayerWins(params.id) || getPlayerWins(player.slug ?? player.name),
		playerAgents: getPlayerAgents(player),
		socialPlatforms: await getSocialPlatforms()
	};
};
