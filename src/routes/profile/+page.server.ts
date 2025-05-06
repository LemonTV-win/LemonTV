import * as auth from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { eq } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/login');
	}
	return { user: event.locals.user };
};

export const actions: Actions = {
	logout: async (event) => {
		if (!event.locals.session) {
			return fail(401);
		}
		await auth.invalidateSession(event.locals.session.id);
		auth.deleteSessionTokenCookie(event);

		return redirect(302, '/login');
	},
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
			return fail(400, { error: 'Failed to change password. Please check your current password.' });
		}
	}
};
