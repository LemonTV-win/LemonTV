import type { PageServerLoad } from './$types';

import {
	getTeam,
	getTeamStatistics,
	getTeamMatches,
	getTeams,
	getTeamMemberStatistics
} from '$lib/server/data/teams';
import { error } from '@sveltejs/kit';
import { processImageURL } from '$lib/server/storage';

export const load: PageServerLoad = async ({ params, locals: { user } }) => {
	const team = await getTeam(params.id);

	if (!team) {
		throw error(404, 'Team not found');
	}

	const teams = await getTeams();
	return {
		team: {
			...team,
			logoURL: team.logoURL ? await processImageURL(team.logoURL) : null
		},
		teams: new Map(teams.map((team) => [team.abbr ?? team.id ?? team.name ?? team.slug, team])), // TODO: remove this
		teamMatches: getTeamMatches(team),
		teamMemberStatistics: getTeamMemberStatistics(team),
		teamStatistics: await getTeamStatistics(team),
		user
	};
};
