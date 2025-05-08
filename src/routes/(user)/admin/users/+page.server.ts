import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { and, eq } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	// Admin-only restriction
	if (!event.locals.user) {
		throw redirect(302, '/login');
	}

	// Check if user has admin role - editors should not access this page
	const parentData = await event.parent();
	if (parentData.role !== 'admin') {
		throw redirect(302, '/admin');
	}

	const users = await db.select().from(table.user);
	const roles = await db.select().from(table.role);
	const userRoles = await db.select().from(table.userRole);

	return {
		users,
		roles,
		userRoles
	};
};

export const actions: Actions = {
	updateRole: async ({ request }) => {
		const formData = await request.formData();
		const userId = formData.get('userId') as string;
		const roleId = formData.get('roleId') as string;
		const action = formData.get('action') as 'add' | 'remove';

		if (!userId || !roleId || !action) {
			return { error: 'Missing required fields' };
		}

		try {
			if (action === 'add') {
				await db.insert(table.userRole).values({
					userId,
					roleId
				});
			} else {
				await db
					.delete(table.userRole)
					.where(and(eq(table.userRole.userId, userId), eq(table.userRole.roleId, roleId)));
			}
			return { success: true };
		} catch (e) {
			console.error('Error updating role:', e);
			return { error: 'Failed to update role' };
		}
	},

	createRole: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get('name') as string;

		if (!name) {
			return { error: 'Role name is required' };
		}

		try {
			await db.insert(table.role).values({
				id: crypto.randomUUID(),
				name
			});
			return { success: true };
		} catch (e) {
			console.error('Error creating role:', e);
			return { error: 'Failed to create role' };
		}
	},

	updateRoleName: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		const name = formData.get('name') as string;

		if (!id || !name) {
			return { error: 'Role ID and name are required' };
		}

		try {
			await db.update(table.role).set({ name }).where(eq(table.role.id, id));
			return { success: true };
		} catch (e) {
			console.error('Error updating role:', e);
			return { error: 'Failed to update role' };
		}
	},

	deleteRole: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return { error: 'Role ID is required' };
		}

		try {
			await db.delete(table.role).where(eq(table.role.id, id));
			return { success: true };
		} catch (e) {
			console.error('Error deleting role:', e);
			return { error: 'Failed to delete role' };
		}
	}
};
