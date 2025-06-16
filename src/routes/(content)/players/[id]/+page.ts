import type { PageMetadata } from '$lib/seo';
import type { PageLoad } from './$types';
import { m } from '$lib/paraglide/messages';

export const load: PageLoad = async ({ data }) => {
	return {
		...data,
		metadata: {
			title: `${data.player.name} | LemonTV`,
			description: m.player_page_description({ name: data.player.name })
		} as PageMetadata
	};
};
