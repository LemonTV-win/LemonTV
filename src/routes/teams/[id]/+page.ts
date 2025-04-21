import type { PageLoad } from './$types';

import { getTeam, getTeamMatches, getTeamMemberStatistics, getTeamStatistics } from '$lib/data';
import { error } from '@sveltejs/kit';

export const load: PageLoad = ({ params }) => {
	const team = getTeam(params.id);
	if (!team) {
		throw error(404, 'Team not found');
	}
	return {
		team,
		teamMatches: getTeamMatches(params.id),
		teamMemberStatistics: getTeamMemberStatistics(team),
		teamStatistics: getTeamStatistics(team)
	};
};
