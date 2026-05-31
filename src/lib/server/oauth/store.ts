/**
 * Persistence for the OAuth authorization server: clients, authorization codes,
 * and refresh tokens. Authorization codes and refresh tokens are SINGLE-USE —
 * redemption flips `consumedAt` under a `WHERE consumedAt IS NULL AND not expired`
 * guard via `UPDATE … RETURNING`, so two concurrent requests can never both
 * spend one credential (no read-then-write race).
 */
import { and, eq, gt, isNull } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import type { OAuthClient } from '$lib/server/db/schema';
import { generateAuthCode, generateClientId, generateRefreshToken, hashSecret } from './secret';
import { AUTH_CODE_TTL_MS, REFRESH_TOKEN_TTL_SECONDS } from './config';

// ---------------------------------------------------------------- clients ----

export async function registerClient(meta: {
	redirectUris: string[];
	clientName: string | null;
	clientUri: string | null;
	logoUri: string | null;
	scope: string | null;
	softwareId: string | null;
}): Promise<OAuthClient> {
	const now = new Date();
	const row: table.NewOAuthClient = {
		id: generateClientId(),
		clientName: meta.clientName,
		redirectUris: JSON.stringify(meta.redirectUris),
		grantTypes: JSON.stringify(['authorization_code', 'refresh_token']),
		responseTypes: JSON.stringify(['code']),
		tokenEndpointAuthMethod: 'none',
		scope: meta.scope,
		clientUri: meta.clientUri,
		logoUri: meta.logoUri,
		softwareId: meta.softwareId,
		createdAt: now
	};
	await db.insert(table.oauthClient).values(row);
	return row as OAuthClient;
}

export async function getClient(clientId: string): Promise<OAuthClient | null> {
	const [row] = await db.select().from(table.oauthClient).where(eq(table.oauthClient.id, clientId));
	return row ?? null;
}

/** Parse the stored JSON redirect_uris, tolerating corruption (→ empty list). */
export function clientRedirectUris(client: OAuthClient): string[] {
	try {
		const parsed = JSON.parse(client.redirectUris);
		return Array.isArray(parsed) ? parsed.filter((u): u is string => typeof u === 'string') : [];
	} catch {
		return [];
	}
}

// ------------------------------------------------------------ auth codes ----

/** Issue an authorization code; returns the plaintext code (only its hash is stored). */
export async function issueAuthCode(params: {
	clientId: string;
	userId: string;
	redirectUri: string;
	codeChallenge: string;
	scope: string;
	resource: string;
}): Promise<string> {
	const code = generateAuthCode();
	const now = new Date();
	await db.insert(table.oauthAuthCode).values({
		id: crypto.randomUUID(),
		tokenHash: hashSecret(code),
		clientId: params.clientId,
		userId: params.userId,
		redirectUri: params.redirectUri,
		codeChallenge: params.codeChallenge,
		codeChallengeMethod: 'S256',
		scope: params.scope,
		resource: params.resource,
		expiresAt: new Date(now.getTime() + AUTH_CODE_TTL_MS),
		createdAt: now
	});
	return code;
}

/**
 * Atomically claim an authorization code. Returns the row only if it existed,
 * was unconsumed, and was unexpired — otherwise null. The claim is the write
 * itself, so replay/double-spend is impossible.
 */
export async function consumeAuthCode(code: string): Promise<table.OAuthAuthCode | null> {
	const now = new Date();
	const [row] = await db
		.update(table.oauthAuthCode)
		.set({ consumedAt: now })
		.where(
			and(
				eq(table.oauthAuthCode.tokenHash, hashSecret(code)),
				isNull(table.oauthAuthCode.consumedAt),
				gt(table.oauthAuthCode.expiresAt, now)
			)
		)
		.returning();
	return row ?? null;
}

// --------------------------------------------------------- refresh tokens ----

/** Issue a refresh token; returns the plaintext token (only its hash is stored). */
export async function issueRefreshToken(params: {
	clientId: string;
	userId: string;
	scope: string;
	resource: string;
}): Promise<string> {
	const token = generateRefreshToken();
	const now = new Date();
	await db.insert(table.oauthRefreshToken).values({
		id: crypto.randomUUID(),
		tokenHash: hashSecret(token),
		clientId: params.clientId,
		userId: params.userId,
		scope: params.scope,
		resource: params.resource,
		expiresAt: new Date(now.getTime() + REFRESH_TOKEN_TTL_SECONDS * 1000),
		createdAt: now
	});
	return token;
}

/**
 * Atomically claim (rotate) a refresh token. Returns the row only if valid,
 * unconsumed, and unexpired. Caller issues a replacement.
 */
export async function consumeRefreshToken(token: string): Promise<table.OAuthRefreshToken | null> {
	const now = new Date();
	const [row] = await db
		.update(table.oauthRefreshToken)
		.set({ consumedAt: now })
		.where(
			and(
				eq(table.oauthRefreshToken.tokenHash, hashSecret(token)),
				isNull(table.oauthRefreshToken.consumedAt),
				gt(table.oauthRefreshToken.expiresAt, now)
			)
		)
		.returning();
	return row ?? null;
}

/** Revoke every outstanding refresh token for a (client,user) — used on code replay. */
export async function revokeRefreshTokensForUserClient(
	userId: string,
	clientId: string
): Promise<void> {
	await db
		.update(table.oauthRefreshToken)
		.set({ consumedAt: new Date() })
		.where(
			and(
				eq(table.oauthRefreshToken.userId, userId),
				eq(table.oauthRefreshToken.clientId, clientId),
				isNull(table.oauthRefreshToken.consumedAt)
			)
		);
}
