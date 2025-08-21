import { m } from '$lib/paraglide/messages';
import type { PageMetadata } from '$lib/seo';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data, url }) => {
	const urlParams = {
		action: url.searchParams.get('action'),
		id: url.searchParams.get('id'),
		delete: url.searchParams.get('delete'),
		stageId: url.searchParams.get('stageId'),
		gameId: url.searchParams.get('gameId'),
		matchId: url.searchParams.get('matchId')
	};

	return {
		...data, // Data from server
		...urlParams, // TODO: use data.urlParams.* instead of data.* for url params
		metadata: {
			title: `${data.event.name} | ${m.matches()} | ${m.admin_panel()} | LemonTV`,
			description: m.admin_matches_desc()
		} as PageMetadata
	};
};
