import type { PageServerLoad } from './$types';
import { getEvents } from '$lib/data';
import { getEssentialEvents } from '$lib/server/data/events';

export const load: PageServerLoad = async ({ url }) => {
	const searchQuery = url.searchParams.get('searchQuery');

	return {
		events: [...getEvents(), ...(await getEssentialEvents())],
		searchQuery
	};
};
