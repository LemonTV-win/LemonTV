import { m } from '$lib/paraglide/messages';
import type { PageMetadata } from '$lib/seo';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data, url }) => {
	const urlParams = {
		action: url.searchParams.get('action'),
		id: url.searchParams.get('id'),
		searchQuery: url.searchParams.get('searchQuery')
	};

	return {
		...data,
		...urlParams,
		metadata: {
			title: `${m.players()} | ${m.admin_panel()} | LemonTV`,
			description: m.players_description()
		} as PageMetadata
	};
};
