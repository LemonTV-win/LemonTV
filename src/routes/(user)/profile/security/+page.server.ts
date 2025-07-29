import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import * as auth from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals: { user }, url }) => {
	if (!user) {
		const fullUrl = url.pathname + url.search;
		throw redirect(302, `/login?redirect=${encodeURIComponent(fullUrl)}`);
	}

	return {
		user
	};
};

export const actions: Actions = {
	changePassword: async (event) => {
		if (!event.locals.user) {
			return fail(401);
		}

		const data = await event.request.formData();
		const currentPassword = data.get('currentPassword');
		const newPassword = data.get('newPassword');
		const confirmPassword = data.get('confirmPassword');

		if (!currentPassword || !newPassword || !confirmPassword) {
			return fail(400, { error: 'All fields are required' });
		}

		if (newPassword !== confirmPassword) {
			return fail(400, { error: 'New passwords do not match' });
		}

		try {
			const [user] = await db
				.select()
				.from(table.user)
				.where(eq(table.user.id, event.locals.user.id));
			if (!user) {
				return fail(400, { error: 'User not found' });
			}

			const validCurrentPassword = await auth.verifyPassword(
				currentPassword.toString(),
				user.passwordHash
			);
			if (!validCurrentPassword) {
				return fail(400, { error: 'Current password is incorrect' });
			}

			const newPasswordHash = await auth.hashPassword(newPassword.toString());
			await db
				.update(table.user)
				.set({ passwordHash: newPasswordHash })
				.where(eq(table.user.id, event.locals.user.id));

			return { success: true };
		} catch (error) {
			console.error(`Failed to change password: ${error}`);
			return fail(400, { error: 'Failed to change password. Please check your current password.' });
		}
	}
};
