import { fail, error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { RESET_PASSWORD_SCHEMA } from '$lib/validations/auth';
import {
	validatePasswordResetToken,
	invalidatePasswordResetToken,
	hashPassword
} from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	console.info('[Reset Password Load] URL:', url.toString());
	console.info(
		'[Reset Password Load] Search params:',
		Object.fromEntries(url.searchParams.entries())
	);

	const encodedToken = url.searchParams.get('token');
	console.info('[Reset Password Load] Encoded token:', encodedToken);

	if (!encodedToken) {
		console.info('[Reset Password Load] No token found in URL');
		throw error(400, 'Missing reset token');
	}

	// Decode the URL-encoded token
	const token = decodeURIComponent(encodedToken);
	console.info('[Reset Password Load] Decoded token:', token);

	// Validate the token
	const userId = await validatePasswordResetToken(token);
	console.info('[Reset Password Load] Validation result - userId:', userId);

	if (!userId) {
		console.info('[Reset Password Load] Token validation failed');
		throw error(400, 'Invalid or expired reset token');
	}

	console.info('[Reset Password Load] Token validated successfully');
	return { token };
};

export const actions: Actions = {
	resetPassword: async (event) => {
		console.info('[Reset Password Action] Attempting password reset');
		console.info('[Reset Password Action] URL:', event.url.toString());
		console.info(
			'[Reset Password Action] Search params:',
			Object.fromEntries(event.url.searchParams.entries())
		);

		const formData = await event.request.formData();
		const data = {
			password: formData.get('password'),
			confirmPassword: formData.get('confirmPassword'),
			token: formData.get('token')
		};

		console.info('[Reset Password Action] Form data:', data);

		const result = RESET_PASSWORD_SCHEMA.safeParse(data);
		if (!result.success) {
			console.warn('[Reset Password Action] Validation failed:', result.error.issues[0].message);
			return fail(400, {
				message: result.error.issues[0].message
			});
		}

		const token = data.token as string;
		console.info('[Reset Password Action] Token from form:', token);

		if (!token) {
			console.info('[Reset Password Action] No token found in form submission');
			return fail(400, {
				message: 'Missing reset token'
			});
		}

		// Validate the token again (in case it expired during form submission)
		const userId = await validatePasswordResetToken(token);
		console.info('[Reset Password Action] Token validation result - userId:', userId);

		if (!userId) {
			console.info('[Reset Password Action] Token validation failed in action');
			return fail(400, {
				message: 'Invalid or expired reset token'
			});
		}

		// Hash the new password
		const newPasswordHash = await hashPassword(result.data.password);

		// Update the user's password
		await db
			.update(table.user)
			.set({ passwordHash: newPasswordHash })
			.where(eq(table.user.id, userId));

		// Invalidate the reset token
		await invalidatePasswordResetToken(token);

		console.info('[Reset Password Action] Password successfully reset for user:', userId);

		// Redirect to login page with success message
		throw redirect(302, '/login?message=password_reset_success');
	}
};
