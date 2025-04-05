import type { PageLoad } from './$types';
import { getEvents } from '$lib/data';

export const load: PageLoad = () => {
	return {
		events: getEvents()
	};
};
