import { m } from '$lib/paraglide/messages';
import type { PageMetadata } from '$lib/seo';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	return {
		metadata: {
			title: `${m.admin_panel()} | LemonTV`,
			description: m.welcome_admin()
		} as PageMetadata
	};
};
