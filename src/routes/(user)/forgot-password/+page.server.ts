import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { FORGOT_PASSWORD_SCHEMA } from '$lib/validations/auth';
import { generatePasswordResetToken, sendPasswordResetEmail } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {};
};

export const actions: Actions = {
	forgotPassword: async (event) => {
		console.info('[Forgot Password] Attempting password reset request');
		const formData = await event.request.formData();
		const data = {
			email: formData.get('email')
		};

		const result = FORGOT_PASSWORD_SCHEMA.safeParse(data);
		if (!result.success) {
			console.warn('[Forgot Password] Validation failed:', result.error.issues[0].message);
			return fail(400, {
				message: result.error.issues[0].message
			});
		}

		try {
			// Find user by email
			const [user] = await db
				.select()
				.from(table.user)
				.where(eq(table.user.email, result.data.email));

			if (!user) {
				// Don't reveal if email exists or not for security
				console.info('[Forgot Password] Email not found (or pretending not found for security)');
				return { success: true };
			}

			// Generate password reset token
			const token = await generatePasswordResetToken(user.id);

			// Send password reset email
			await sendPasswordResetEmail(user.email, token, event.url.origin);

			console.info('[Forgot Password] Password reset email sent to:', user.email);
			return { success: true };
		} catch (error) {
			console.error('[Forgot Password] Error:', error);
			return fail(500, {
				message: 'Failed to send password reset email. Please try again.'
			});
		}
	}
};
