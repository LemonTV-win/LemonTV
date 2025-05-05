import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';

export const load: PageServerLoad = async (event) => {
	// TODO: Admin user role restriction
	if (!event.locals.user) {
		return redirect(302, '/login');
	}

	const users = await db.select().from(table.user);
	return { users };
};
