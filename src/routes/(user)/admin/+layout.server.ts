import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { eq, and, or } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	// Check if user has admin or editor role
	const roles = await db
		.select()
		.from(table.role)
		.where(or(eq(table.role.id, 'admin'), eq(table.role.id, 'editor')));

	if (roles.length === 0) {
		throw new Error('Required roles not found in database');
	}

	const adminRole = roles.find((role) => role.id === 'admin');
	const editorRole = roles.find((role) => role.id === 'editor');

	if (!adminRole || !editorRole) {
		throw new Error('Admin or editor role not found in database');
	}

	const userRoles = await db
		.select()
		.from(table.userRole)
		.where(
			and(
				eq(table.userRole.userId, locals.user.id),
				or(eq(table.userRole.roleId, adminRole.id), eq(table.userRole.roleId, editorRole.id))
			)
		);

	if (userRoles.length === 0) {
		throw redirect(302, '/');
	}

	// Determine the user's highest role (admin > editor)
	const isAdmin = userRoles.some((role) => role.roleId === adminRole.id);
	const role = isAdmin ? 'admin' : 'editor';

	return {
		user: locals.user,
		role
	};
};
