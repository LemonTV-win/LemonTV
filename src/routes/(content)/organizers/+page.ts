import type { PageMetadata } from '$lib/seo';
import type { PageLoad } from './$types';
import { m } from '$lib/paraglide/messages';

export const load: PageLoad = async ({ data }) => {
	return {
		...data,
		metadata: {
			title: `${m.organizers()} | LemonTV`,
			description: m.organizers_description()
		} as PageMetadata
	};
};
