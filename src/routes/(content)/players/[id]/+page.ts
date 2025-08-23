import type { PageMetadata } from '$lib/seo';
import type { PageLoad } from './$types';
import { SITE_CANONICAL_HOST } from '$lib/consts';
import { m } from '$lib/paraglide/messages';
import { getLocale } from '$lib/paraglide/runtime';

export const load: PageLoad = async ({ data }) => {
	return {
		...data,
		metadata: {
			title: `${data.player.name} | ${m.strinova_player_profile()} | LemonTV`,
			description: m.player_page_description({ name: data.player.name }),
			ogImageUrl: `${SITE_CANONICAL_HOST}/api/og/players/${encodeURIComponent(data.player.slug || data.player.id)}?locale=${getLocale()}`
		} as PageMetadata
	};
};
