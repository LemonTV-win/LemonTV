import type { PageMetadata } from '$lib/seo';
import type { PageLoad } from './$types';
import { m } from '$lib/paraglide/messages';

export const load: PageLoad = async ({ data }) => {
	return {
		...data,
		metadata: {
			title: `${m.news()} | LemonTV`,
			description: m.news_placeholder_description()
		} as PageMetadata
	};
};
