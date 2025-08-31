import { m } from '$lib/paraglide/messages';
import type { PageMetadata } from '$lib/seo';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data, url }) => {
	const urlParams = {
		searchQuery: url.searchParams.get('searchQuery')
	};

	return {
		...data,
		...urlParams,
		metadata: {
			title: `${m.users()} | ${m.admin_panel()} | LemonTV`,
			description: m.admin_dashboard()
		} as PageMetadata
	};
};
