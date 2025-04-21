import type { PageLoad } from './$types';

import { getTeam, getTeamMatches } from '$lib/data';

export const load: PageLoad = ({ params }) => {
	return {
		team: getTeam(params.id),
		teamMatches: getTeamMatches(params.id)
	};
};
