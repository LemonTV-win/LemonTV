import type { PageMetadata } from '$lib/seo';
import type { PageLoad } from './$types';
import { m } from '$lib/paraglide/messages';

export const load: PageLoad = async ({ data, url }) => {
	const stageId = url.searchParams.get('stage');
	let initialStage = null;

	if (stageId) {
		initialStage = data.event.stages.find((s) => s.id === parseInt(stageId));
	}

	return {
		...data,
		initialStage,
		metadata: {
			title: `${data.event.name} | LemonTV`,
			description: m.event_page_description({ name: data.event.name })
		} as PageMetadata
	};
};
