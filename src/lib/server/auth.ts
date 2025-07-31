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
 * 🔑 Password Reset Tokens
 * - Duration: 1 hour
 * - Purpose: Allow users to reset their password
 * - Storage: Database record with expiration timestamp
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
import { dev } from '$app/environment';
import { Resend } from 'resend';

const HOUR_IN_MS = 1000 * 60 * 60;
const DAY_IN_MS = HOUR_IN_MS * 24;

// Session duration constants following security best practices
const REGULAR_SESSION_DURATION = dev ? 30 * 1000 : HOUR_IN_MS * 4; // 30s in dev, 4h in prod
const REMEMBER_ME_SESSION_DURATION = DAY_IN_MS * 14; // 14 days for remember me (unchanged)
const SESSION_RENEWAL_THRESHOLD = dev ? 10 * 1000 : HOUR_IN_MS * 2; // 10s in dev, 2h in prod

// Password reset token duration (1 hour)
const PASSWORD_RESET_TOKEN_DURATION = HOUR_IN_MS;

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

	console.info(
		`[Auth] Creating session for user ${userId}: ${rememberMe ? 'remember me' : 'regular'} (${sessionDuration / 1000}s duration, expires at ${session.expiresAt.toISOString()})`
	);

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
		console.info('[Auth] No session found for token');
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

	const now = Date.now();
	const sessionExpired = now >= session.expiresAt.getTime();
	const timeUntilExpiration = session.expiresAt.getTime() - now;

	console.info(
		`[Auth] Validating session for user ${user.username}: expires at ${session.expiresAt.toISOString()}, ${Math.round(timeUntilExpiration / 1000)}s remaining`
	);

	if (sessionExpired) {
		console.info(`[Auth] Session expired for user ${user.username}, cleaning up`);
		await db.delete(table.session).where(eq(table.session.id, session.id));
		return { session: null, user: null };
	}

	// Implement sliding expiration - renew session if close to expiration
	const shouldRenewSession = timeUntilExpiration < SESSION_RENEWAL_THRESHOLD;

	if (shouldRenewSession) {
		// Determine if this was originally a remember me session (long duration)
		const originalDuration = session.expiresAt.getTime() - (now - timeUntilExpiration);
		const wasRememberMe = originalDuration > REGULAR_SESSION_DURATION;

		// Renew with the same duration type
		const newDuration = wasRememberMe ? REMEMBER_ME_SESSION_DURATION : REGULAR_SESSION_DURATION;
		const oldExpiresAt = session.expiresAt;
		session.expiresAt = new Date(now + newDuration);

		console.info(
			`[Auth] Renewing session for user ${user.username} (${wasRememberMe ? 'remember me' : 'regular'}): ${oldExpiresAt.toISOString()} → ${session.expiresAt.toISOString()}`
		);

		await db
			.update(table.session)
			.set({ expiresAt: session.expiresAt })
			.where(eq(table.session.id, session.id));
	} else {
		console.info(`[Auth] Session for user ${user.username} is still valid, no renewal needed`);
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

// Password Reset Functions

export async function generatePasswordResetToken(userId: string): Promise<string> {
	// Generate a secure random token
	const tokenBytes = crypto.getRandomValues(new Uint8Array(32));
	const token = encodeBase64url(tokenBytes);

	// Create token record in database
	const tokenId = crypto.randomUUID();
	const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_DURATION);
	const createdAt = new Date();

	await db.insert(table.passwordResetToken).values({
		id: tokenId,
		userId,
		token,
		expiresAt,
		createdAt
	});

	return token;
}

export async function validatePasswordResetToken(token: string): Promise<string | null> {
	console.info('[Auth] Validating password reset token:', token);

	// Find the token in the database
	const [tokenRecord] = await db
		.select()
		.from(table.passwordResetToken)
		.where(eq(table.passwordResetToken.token, token));

	console.info('[Auth] Token record found:', tokenRecord ? 'Yes' : 'No');

	if (!tokenRecord) {
		console.info('[Auth] No token record found in database');
		return null;
	}

	console.info('[Auth] Token expires at:', tokenRecord.expiresAt);
	console.info('[Auth] Current time:', new Date());
	console.info('[Auth] Token expired:', Date.now() >= tokenRecord.expiresAt.getTime());

	// Check if token is expired
	if (Date.now() >= tokenRecord.expiresAt.getTime()) {
		console.info('[Auth] Token is expired, cleaning up');
		// Clean up expired token
		await db
			.delete(table.passwordResetToken)
			.where(eq(table.passwordResetToken.id, tokenRecord.id));
		return null;
	}

	console.info('[Auth] Token is valid, returning userId:', tokenRecord.userId);
	return tokenRecord.userId;
}

export async function invalidatePasswordResetToken(token: string): Promise<void> {
	await db.delete(table.passwordResetToken).where(eq(table.passwordResetToken.token, token));
}

export async function sendPasswordResetEmail(
	email: string,
	token: string,
	baseUrl: string
): Promise<void> {
	const resend = new Resend('**REDACTED_API_KEY**');
	const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;
	const logoUrl = `${baseUrl}/favicon-96x96.png`;

	try {
		await resend.emails.send({
			from: 'support@lemontv.win',
			to: email,
			subject: 'Password Reset Request - LemonTV',
			html: `
				<body style="background: #18181b; margin: 0; padding: 0; font-family: 'Inter', Arial, sans-serif;">
					<table width="100%" bgcolor="#18181b" cellpadding="0" cellspacing="0" style="padding: 0; margin: 0;">
						<tr>
							<td align="center" style="padding: 40px 0;">
								<table width="100%" style="max-width: 480px; background: #23232b; border-radius: 18px; box-shadow: 0 4px 32px 0 rgba(0,0,0,0.18); overflow: hidden;">
									<tr>
										<td align="center" style="background: #18181b; padding: 32px 0 16px 0;">
											<img src="${logoUrl}" alt="LemonTV Logo" style="height: 56px; margin-bottom: 8px; display: block;" />
											<h1 style="color: #fbbf24; font-size: 2rem; font-weight: 800; margin: 0; letter-spacing: 1px;">LemonTV</h1>
										</td>
									</tr>
									<tr>
										<td style="padding: 32px 32px 24px 32px;">
											<h2 style="color: #fff; font-size: 1.25rem; font-weight: 700; margin-bottom: 18px;">Password Reset Request</h2>
											<p style="color: #d1d5db; font-size: 1rem; line-height: 1.7; margin-bottom: 28px;">
												You requested a password reset for your LemonTV account. Click the button below to reset your password:
											</p>
											<div style="text-align: center; margin: 32px 0;">
												<a href="${resetUrl}"
												   style="background: #fbbf24; color: #18181b; padding: 14px 36px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 1.1rem; box-shadow: 0 2px 8px 0 rgba(251,191,36,0.10); display: inline-block; letter-spacing: 0.5px;">
													Reset Password
												</a>
											</div>
											<p style="color: #d1d5db; font-size: 0.98rem; margin-bottom: 18px;">
												If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
											</p>
											<p style="color: #a1a1aa; font-size: 0.92rem; margin-top: 32px; border-top: 1px solid #2d2d36; padding-top: 18px;">
												This link will expire in <b>1 hour</b> for security reasons.
											</p>
											<p style="color: #a1a1aa; font-size: 0.92rem;">
												If the button doesn't work, copy and paste this link into your browser:<br>
												<a href="${resetUrl}" style="color: #fbbf24; word-break: break-all;">${resetUrl}</a>
											</p>
										</td>
									</tr>
								</table>
							</td>
						</tr>
					</table>
				</body>
			`
		});

		console.info('[Auth] Password reset email sent successfully to:', email);
	} catch (error) {
		console.error('[Auth] Failed to send password reset email:', error);
		throw new Error('Failed to send password reset email');
	}
}

export async function sendWelcomeEmail(
	email: string,
	username: string,
	baseUrl: string
): Promise<void> {
	const resend = new Resend('**REDACTED_API_KEY**');
	const loginUrl = `${baseUrl}/login`;
	const logoUrl = `${baseUrl}/favicon-96x96.png`;

	try {
		await resend.emails.send({
			from: 'support@lemontv.win',
			to: email,
			subject: 'Welcome to LemonTV! 🍋',
			html: `
				<body style="background: #18181b; margin: 0; padding: 0; font-family: 'Inter', Arial, sans-serif;">
					<table width="100%" bgcolor="#18181b" cellpadding="0" cellspacing="0" style="padding: 0; margin: 0;">
						<tr>
							<td align="center" style="padding: 40px 0;">
								<table width="100%" style="max-width: 480px; background: #23232b; border-radius: 18px; box-shadow: 0 4px 32px 0 rgba(0,0,0,0.18); overflow: hidden;">
									<tr>
										<td align="center" style="background: #18181b; padding: 32px 0 16px 0;">
											<img src="${logoUrl}" alt="LemonTV Logo" style="height: 56px; margin-bottom: 8px; display: block;" />
											<h1 style="color: #fbbf24; font-size: 2rem; font-weight: 800; margin: 0; letter-spacing: 1px;">LemonTV</h1>
										</td>
									</tr>
									<tr>
										<td style="padding: 32px 32px 24px 32px;">
											<h2 style="color: #fff; font-size: 1.25rem; font-weight: 700; margin-bottom: 18px;">Welcome to LemonTV, ${username}! 🎉</h2>
											<p style="color: #d1d5db; font-size: 1rem; line-height: 1.7; margin-bottom: 28px;">
												Thank you for joining LemonTV! Your account has been successfully created and you're now ready to explore our platform.
											</p>
											<div style="text-align: center; margin: 32px 0;">
												<a href="${loginUrl}"
												   style="background: #fbbf24; color: #18181b; padding: 14px 36px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 1.1rem; box-shadow: 0 2px 8px 0 rgba(251,191,36,0.10); display: inline-block; letter-spacing: 0.5px;">
													Start Exploring
												</a>
											</div>
											<p style="color: #d1d5db; font-size: 0.98rem; margin-bottom: 18px;">
												You can now log in to your account and start enjoying all the features LemonTV has to offer.
											</p>
											<p style="color: #a1a1aa; font-size: 0.92rem; margin-top: 32px; border-top: 1px solid #2d2d36; padding-top: 18px;">
												If you have any questions or need assistance, feel free to reach out to our support team.
											</p>
											<p style="color: #a1a1aa; font-size: 0.92rem;">
												Welcome aboard! 🚀
											</p>
										</td>
									</tr>
								</table>
							</td>
						</tr>
					</table>
				</body>
			`
		});

		console.info('[Auth] Welcome email sent successfully to:', email);
	} catch (error) {
		console.error('[Auth] Failed to send welcome email:', error);
		throw new Error('Failed to send welcome email');
	}
}
