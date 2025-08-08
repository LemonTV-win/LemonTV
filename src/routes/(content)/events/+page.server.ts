import type { PageServerLoad } from './$types';
import { getEssentialEvents } from '$lib/server/data/events';

export const load: PageServerLoad = async ({ url }) => {
	const searchQuery = url.searchParams.get('searchQuery');

	return {
		events: await getEssentialEvents(),
		searchQuery
	};
};
