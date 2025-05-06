import { encodeBase32LowerCase } from '@oslojs/encoding';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import * as auth from '$lib/server/auth';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

const USERNAME_SCHEMA = z
	.string()
	.min(3, 'Username must be at least 3 characters')
	.max(31, 'Username must be at most 31 characters')
	.regex(
		/^[\p{L}\p{N}_\-]+$/u,
		'Username can only contain letters, numbers, punctuation, and underscores'
	);

const PASSWORD_SCHEMA = z
	.string()
	.min(8, 'Password must be at least 8 characters')
	.max(255, 'Password must be at most 255 characters');

const EMAIL_SCHEMA = z
	.string()
	.min(3, 'Email must be at least 3 characters')
	.max(255, 'Email must be at most 255 characters')
	.email('Invalid email format');

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
		const username = formData.get('username');
		const password = formData.get('password');

		const usernameResult = USERNAME_SCHEMA.safeParse(username);
		if (!usernameResult.success) {
			return fail(400, {
				message: usernameResult.error.errors[0].message
			});
		}

		const passwordResult = PASSWORD_SCHEMA.safeParse(password);
		if (!passwordResult.success) {
			return fail(400, {
				message: passwordResult.error.errors[0].message
			});
		}

		const results = await db
			.select()
			.from(table.user)
			.where(eq(table.user.username, usernameResult.data));

		const existingUser = results.at(0);
		if (!existingUser) {
			return fail(400, { message: 'Incorrect username or password' });
		}

		const validPassword = await auth.verifyPassword(passwordResult.data, existingUser.passwordHash);
		if (!validPassword) {
			return fail(400, { message: 'Incorrect username or password' });
		}

		const sessionToken = auth.generateSessionToken();
		const session = await auth.createSession(sessionToken, existingUser.id);
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

		return redirect(302, '/profile');
	},
	register: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get('username');
		const password = formData.get('password');
		const email = formData.get('email');

		const usernameResult = USERNAME_SCHEMA.safeParse(username);
		if (!usernameResult.success) {
			return fail(400, {
				message: usernameResult.error.errors[0].message
			});
		}

		const passwordResult = PASSWORD_SCHEMA.safeParse(password);
		if (!passwordResult.success) {
			return fail(400, {
				message: passwordResult.error.errors[0].message
			});
		}

		const emailResult = EMAIL_SCHEMA.safeParse(email);
		if (!emailResult.success) {
			return fail(400, {
				message: emailResult.error.errors[0].message
			});
		}

		const userId = generateUserId();
		const passwordHash = await auth.hashPassword(passwordResult.data);

		try {
			await db.insert(table.user).values({
				id: userId,
				username: usernameResult.data,
				passwordHash,
				email: emailResult.data,
				createdAt: new Date()
			});

			// #region Assign admin role to first user
			const [adminRole] = await db.select().from(table.role).where(eq(table.role.id, 'admin'));

			const [existingUser] = await db.select().from(table.user).limit(1);
			if (!existingUser) {
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
		return redirect(302, '/profile');
	}
};

function generateUserId() {
	// ID with 120 bits of entropy, or about the same as UUID v4.
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	const id = encodeBase32LowerCase(bytes);
	return id;
}
