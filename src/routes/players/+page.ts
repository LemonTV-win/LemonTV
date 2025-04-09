import type { PageLoad } from './$types';
import { getPlayers } from '$lib/data';

export const load: PageLoad = () => {
	return {
		players: getPlayers()
	};
};
