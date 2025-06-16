import { m } from '$lib/paraglide/messages';
import type { PageMetadata } from '$lib/seo';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => {
	return {
		...data, // Data from server
		metadata: {
			title: `LemonTV – ${m.title_description()}`,
			description: m.homepage_description()
		} as PageMetadata
	};
};
