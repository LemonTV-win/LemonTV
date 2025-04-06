import type { PageLoad } from './$types';

import { getTeam } from '$lib/data';

export const load: PageLoad = ({ params }) => {
	return {
		team: getTeam(params.id)
	};
};
