import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { user } }) => {
	if (
		!user ||
		user.roles.length === 0 ||
		!['admin', 'editor'].some((role) => user.roles.includes(role))
	) {
		throw redirect(302, '/login');
	}

	return {
		user
	};
};
