import { m } from '$lib/paraglide/messages';
import type { PageMetadata } from '$lib/seo';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data, url }) => {
	return {
		...data,
		page: data.page ? Number(data.page) : 1,
		metadata: {
			title: `${m['editing.history.edit_history']()} | ${m.admin_panel()} | LemonTV`,
			description: m['editing.history.edit_history_desc']
				? m['editing.history.edit_history_desc']()
				: m.admin_panel()
		} as PageMetadata
	};
};
