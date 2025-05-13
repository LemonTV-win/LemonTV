import type { PageServerLoad } from './$types';
import { getEvents } from '$lib/data';
import { getEvents as getServerEvents } from '$lib/server/data/events';

export const load: PageServerLoad = async () => {
	return {
		events: [...getEvents(), ...(await getServerEvents())]
	};
};
