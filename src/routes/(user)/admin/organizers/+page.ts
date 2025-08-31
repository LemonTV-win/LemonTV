import { m } from '$lib/paraglide/messages';
import type { PageMetadata } from '$lib/seo';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data, url }) => {
	const urlParams = {
		searchQuery: url.searchParams.get('searchQuery'),
		action: url.searchParams.get('action'),
		id: url.searchParams.get('id')
	};

	return {
		...data,
		...urlParams,
		metadata: {
			title: `${m.organizers()} | ${m.admin_panel()} | LemonTV`,
			description: m.organizers_description()
		} as PageMetadata
	};
};
