import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { user }, url }) => {
	if (
		!user ||
		user.roles.length === 0 ||
		!['admin', 'editor'].some((role) => user.roles.includes(role))
	) {
		// Preserve the full URL including search parameters
		const fullUrl = url.pathname + url.search;
		throw redirect(302, `/login?redirect=${encodeURIComponent(fullUrl)}`);
	}

	return {
		user
	};
};
