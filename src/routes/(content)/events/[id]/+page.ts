import type { PageMetadata } from '$lib/seo';
import type { PageLoad } from './$types';
import { m } from '$lib/paraglide/messages';

export const load: PageLoad = async ({ data }) => {
	return {
		...data,
		metadata: {
			title: `${data.event.name} | LemonTV`,
			description: m.event_page_description({ name: data.event.name })
		} as PageMetadata
	};
};
