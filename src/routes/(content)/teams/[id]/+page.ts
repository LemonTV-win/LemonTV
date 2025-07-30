import type { PageMetadata } from '$lib/seo';
import type { PageLoad } from './$types';
import { m } from '$lib/paraglide/messages';

export const load: PageLoad = async ({ data }) => {
	return {
		...data,
		metadata: {
			title: `${data.team.name} | ${m.strinova_team_overview()} | LemonTV`,
			description: m.team_page_description({ name: data.team.name })
		} as PageMetadata
	};
};
