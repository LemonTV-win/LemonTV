import type { PageServerLoad } from './$types';
import { getEvents } from '$lib/data';
import { getEssentialEvents } from '$lib/server/data/events';

export const load: PageServerLoad = async () => {
	return {
		events: [...getEvents(), ...(await getEssentialEvents())]
	};
};
