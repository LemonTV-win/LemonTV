import type { PageLoad } from './$types';

import { getPlayer } from '$lib/data';

export const load: PageLoad = ({ params }) => {
	return {
		player: getPlayer(params.id)
	};
};
