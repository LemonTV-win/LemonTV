import type { PageServerLoad } from './$types';
import { getOrganizers } from '$lib/server/data/organizers';

export const load: PageServerLoad = async () => {
	return {
		organizers: await getOrganizers()
	};
};
