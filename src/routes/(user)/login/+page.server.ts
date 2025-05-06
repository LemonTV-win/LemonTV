import { encodeBase32LowerCase } from '@oslojs/encoding';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import * as auth from '$lib/server/auth';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { LOGIN_SCHEMA, REGISTER_SCHEMA } from '$lib/validations/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return redirect(302, '/profile');
	}

	return {
		redirect: event.url.searchParams.get('redirect') || '/'
	};
};

export const actions: Actions = {
	login: async (event) => {
		const formData = await event.request.formData();
		const data = {
			username: formData.get('username'),
			password: formData.get('password')
		};

		const result = LOGIN_SCHEMA.safeParse(data);
		if (!result.success) {
			return fail(400, {
				message: result.error.errors[0].message
			});
		}

		const results = await db
			.select()
			.from(table.user)
			.where(eq(table.user.username, result.data.username));

		const existingUser = results.at(0);
		if (!existingUser) {
			return fail(400, { message: 'Incorrect username or password' });
		}

		const validPassword = await auth.verifyPassword(
			result.data.password,
			existingUser.passwordHash
		);
		if (!validPassword) {
			return fail(400, { message: 'Incorrect username or password' });
		}

		const sessionToken = auth.generateSessionToken();
		const session = await auth.createSession(sessionToken, existingUser.id);
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

		return { success: true };
	},
	register: async (event) => {
		const formData = await event.request.formData();
		const data = {
			username: formData.get('username'),
			email: formData.get('email'),
			password: formData.get('password'),
			confirmPassword: formData.get('confirmPassword'),
			acceptTerms: formData.get('acceptTerms') === 'on'
		};

		const result = REGISTER_SCHEMA.safeParse(data);
		if (!result.success) {
			return fail(400, {
				message: result.error.errors[0].message
			});
		}

		const userId = generateUserId();
		const passwordHash = await auth.hashPassword(result.data.password);

		try {
			await db.insert(table.user).values({
				id: userId,
				username: result.data.username,
				passwordHash,
				email: result.data.email,
				createdAt: new Date()
			});

			// #region Assign admin role to first user
			const users = await db.select().from(table.user).limit(1);
			if (users.length === 0) {
				console.log('[Register] No existing user, assigning admin role');
				const [adminRole] = await db.select().from(table.role).where(eq(table.role.id, 'admin'));
				await db.insert(table.userRole).values({
					userId: userId,
					roleId: adminRole.id
				});
			}
			// #endregion

			const sessionToken = auth.generateSessionToken();
			const session = await auth.createSession(sessionToken, userId);
			auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'An error has occurred' });
		}
		return { success: true };
	}
};

function generateUserId() {
	// ID with 120 bits of entropy, or about the same as UUID v4.
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	const id = encodeBase32LowerCase(bytes);
	return id;
}
