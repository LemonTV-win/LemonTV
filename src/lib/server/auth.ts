/**
 * Authentication and Session Management
 *
 * This module implements secure session management following industry best practices:
 *
 * 🔐 Regular Sessions (Not "Remember Me")
 * - Duration: 4 hours
 * - Purpose: Short-lived sessions for sensitive use cases or shared computers
 * - Storage: Session cookie (deleted when browser closes)
 *
 * 🧠 Remember Me Sessions
 * - Duration: 14 days
 * - Purpose: Persistent login for personal devices
 * - Storage: Persistent cookie with expiration timestamp
 *
 * 🛡 Security Features
 * - HttpOnly cookies to prevent XSS attacks
 * - Secure flag in production (HTTPS only)
 * - SameSite=lax for CSRF protection
 * - Sliding expiration with automatic renewal
 * - Session cleanup on expiration
 * - Ability to invalidate all user sessions
 *
 * Session renewal occurs when less than 2 hours remain, maintaining the original
 * session type (regular vs remember me) for consistent user experience.
 */

import type { RequestEvent } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { hash, verify } from '@node-rs/argon2';

const HOUR_IN_MS = 1000 * 60 * 60;
const DAY_IN_MS = HOUR_IN_MS * 24;

// Session duration constants following security best practices
const REGULAR_SESSION_DURATION = HOUR_IN_MS * 4; // 4 hours for regular sessions
const REMEMBER_ME_SESSION_DURATION = DAY_IN_MS * 14; // 14 days for remember me
const SESSION_RENEWAL_THRESHOLD = HOUR_IN_MS * 2; // Renew session if less than 2 hours remaining

export const sessionCookieName = 'auth-session';

export function generateSessionToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(18));
	const token = encodeBase64url(bytes);
	return token;
}

export async function createSession(token: string, userId: string, rememberMe: boolean = false) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

	// Use security best practices for session duration
	const sessionDuration = rememberMe ? REMEMBER_ME_SESSION_DURATION : REGULAR_SESSION_DURATION;

	const session: table.Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + sessionDuration)
	};
	await db.insert(table.session).values(session);
	return session;
}

export async function validateSessionToken(token: string) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

	// First get the session and user info
	const [result] = await db
		.select({
			user: {
				id: table.user.id,
				username: table.user.username,
				email: table.user.email
			},
			session: table.session
		})
		.from(table.session)
		.innerJoin(table.user, eq(table.session.userId, table.user.id))
		.where(eq(table.session.id, sessionId));

	if (!result) {
		return { session: null, user: null };
	}
	const { session, user } = result;

	// Then get all roles for this user
	const roles = await db
		.select({ roleId: table.userRole.roleId })
		.from(table.userRole)
		.where(eq(table.userRole.userId, user.id));

	// Add roles to user object
	const userWithRoles = {
		...user,
		roles: roles.map((r) => r.roleId)
	};

	const sessionExpired = Date.now() >= session.expiresAt.getTime();
	if (sessionExpired) {
		console.info(`[Auth] Session expired for user ${user.username}, cleaning up`);
		await db.delete(table.session).where(eq(table.session.id, session.id));
		return { session: null, user: null };
	}

	// Implement sliding expiration - renew session if close to expiration
	const timeUntilExpiration = session.expiresAt.getTime() - Date.now();
	const shouldRenewSession = timeUntilExpiration < SESSION_RENEWAL_THRESHOLD;

	if (shouldRenewSession) {
		// Determine if this was originally a remember me session (long duration)
		const originalDuration = session.expiresAt.getTime() - (Date.now() - timeUntilExpiration);
		const wasRememberMe = originalDuration > REGULAR_SESSION_DURATION;

		// Renew with the same duration type
		const newDuration = wasRememberMe ? REMEMBER_ME_SESSION_DURATION : REGULAR_SESSION_DURATION;
		session.expiresAt = new Date(Date.now() + newDuration);

		console.info(
			`[Auth] Renewing session for user ${user.username} (${wasRememberMe ? 'remember me' : 'regular'})`
		);

		await db
			.update(table.session)
			.set({ expiresAt: session.expiresAt })
			.where(eq(table.session.id, session.id));
	}

	return { session, user: userWithRoles };
}

export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>;

export async function invalidateSession(sessionId: string) {
	await db.delete(table.session).where(eq(table.session.id, sessionId));
}

export async function invalidateAllUserSessions(userId: string) {
	await db.delete(table.session).where(eq(table.session.userId, userId));
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date) {
	event.cookies.set(sessionCookieName, token, {
		expires: expiresAt,
		path: '/',
		httpOnly: true, // Prevent XSS attacks
		secure: process.env.NODE_ENV === 'production', // HTTPS only in production
		sameSite: 'lax', // CSRF protection
		maxAge: Math.floor((expiresAt.getTime() - Date.now()) / 1000) // Set maxAge for additional security
	});
}

export function deleteSessionTokenCookie(event: RequestEvent) {
	event.cookies.delete(sessionCookieName, {
		path: '/',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax'
	});
}

export async function hashPassword(password: string) {
	return hash(password, {
		// recommended minimum parameters
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});
}

export async function verifyPassword(password: string, passwordHash: string) {
	return verify(passwordHash, password);
}
