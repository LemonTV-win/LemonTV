import type { PageLoad } from './$types';
import { getTeams } from '$lib/data';

export const load: PageLoad = () => {
	return {
		teams: getTeams()
	};
};
