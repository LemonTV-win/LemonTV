import type { PageLoad } from './$types';

import { getMatch } from '$lib/data';

export const load: PageLoad = ({ params }) => {
	return {
		match: getMatch(Number(params.id))
	};
};
