import type { PageLoad } from './$types';

import { getEvent } from '$lib/data';

export const load: PageLoad = ({ params }) => {
	return {
		event: getEvent(params.id)
	};
};
