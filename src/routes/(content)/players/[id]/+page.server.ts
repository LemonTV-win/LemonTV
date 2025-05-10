import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
	getPlayer,
	getPlayerTeams,
	getPlayerAgents,
	getSocialPlatforms,
	getPlayerMatches,
	getPlayerWins,
	getPlayerEvents
} from '$lib/server/data/players';
import { getTeams } from '$lib/server/data/teams';

export const load: PageServerLoad = async ({ params, locals: { user } }) => {
	const player = await getPlayer(params.id);
	if (!player) {
		throw error(404, 'Player not found');
	}

	const teams = await getTeams();

	return {
		player,
		playerTeams: await getPlayerTeams(params.id),
		playerEvents: getPlayerEvents(params.id) || getPlayerEvents(player.slug ?? player.name),
		playerMatches: getPlayerMatches(params.id) || getPlayerMatches(player.slug ?? player.name),
		playerWins: getPlayerWins(params.id) || getPlayerWins(player.slug ?? player.name),
		playerAgents: getPlayerAgents(player),
		socialPlatforms: await getSocialPlatforms(),
		teams: new Map(teams.map((team) => [team.abbr ?? team.id ?? team.name ?? team.slug, team])), // TODO: remove this
		user
	};
};
