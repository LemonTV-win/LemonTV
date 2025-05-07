import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { eq, and } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schemas';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	// Check if user has admin role
	const [adminRole] = await db.select().from(table.role).where(eq(table.role.id, 'admin'));

	if (!adminRole) {
		throw new Error('Admin role not found in database');
	}

	const [userRole] = await db
		.select()
		.from(table.userRole)
		.where(and(eq(table.userRole.userId, locals.user.id), eq(table.userRole.roleId, adminRole.id)));

	if (!userRole) {
		throw redirect(302, '/');
	}

	return {
		user: locals.user
	};
};
