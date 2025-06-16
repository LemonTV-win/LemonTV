import type { PageMetadata } from '$lib/seo';
import type { PageLoad } from './$types';
import { m } from '$lib/paraglide/messages';

export const load: PageLoad = async ({ data }) => {
	return {
		...data,
		metadata: {
			title: `${m.events()} | LemonTV`,
			description: m.events_description()
		} as PageMetadata
	};
};
