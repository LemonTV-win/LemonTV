import type { PageLoad } from './$types';
import { getEvents, getTeams } from '$lib/data';

export const load: PageLoad = () => {
	return {
		events: getEvents(),
		teams: getTeams()
	};
};
