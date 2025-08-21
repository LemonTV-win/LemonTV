import { m } from '$lib/paraglide/messages';
import type { PageMetadata } from '$lib/seo';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data, url }) => {
	const urlParams = {
		searchQuery: url.searchParams.get('searchQuery')
	};

	return {
		...data, // Data from server
		...urlParams, // TODO: use data.urlParams.* instead of data.* for url params
		metadata: {
			title: `${m.matches()} | ${m.admin_panel()} | LemonTV`,
			description: m.admin_matches_desc()
		} as PageMetadata
	};
};
