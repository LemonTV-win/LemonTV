import type { PageMetadata } from '$lib/seo';
import type { PageLoad } from './$types';
import { m } from '$lib/paraglide/messages';

export const load: PageLoad = async ({ data }) => {
	return {
		...data,
		metadata: {
			title: `${data.organizer.name} | LemonTV`,
			description:
				data.organizer.description || m.organizer_page_description({ name: data.organizer.name })
		} as PageMetadata
	};
};
