import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: LayoutServerLoad = async (event) => {
	const user = event.locals.user;
	let isAdmin = false;

	if (user) {
		const userRoles = await db
			.select()
			.from(table.userRole)
			.where(eq(table.userRole.userId, user.id));

		isAdmin = userRoles.some((role) => role.roleId === 'admin');
	}

	return {
		user,
		isAdmin
	};
};
