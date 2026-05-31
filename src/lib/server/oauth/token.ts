/**
 * Env-bound wrappers around the pure token core — load the existing ES256 key
 * material (the same key served at /.well-known/jwks.json) and mint/verify MCP
 * access tokens.
 */
import { importJWK } from 'jose';
import { Buffer } from 'node:buffer';
import { LEMON_PRIVATE_JWK_BASE64, LEMON_PUBLIC_JWK_BASE64 } from '$env/static/private';
import { JWT_ALG } from './config';
import { signAccessToken, verifyAccessTokenWith, type AccessTokenClaims } from './token-core';

type ImportedKey = Awaited<ReturnType<typeof importJWK>>;

function decodeJwk(base64: string): Record<string, unknown> {
	return JSON.parse(Buffer.from(base64, 'base64url').toString('utf8'));
}

let privateKey: Promise<ImportedKey> | null = null;
let publicKey: Promise<ImportedKey> | null = null;

function getPrivateKey(): Promise<ImportedKey> {
	if (!privateKey) privateKey = importJWK(decodeJwk(LEMON_PRIVATE_JWK_BASE64), JWT_ALG);
	return privateKey;
}
function getPublicKey(): Promise<ImportedKey> {
	if (!publicKey) publicKey = importJWK(decodeJwk(LEMON_PUBLIC_JWK_BASE64), JWT_ALG);
	return publicKey;
}

export async function mintAccessToken(params: {
	sub: string;
	scope: string;
	clientId: string;
	ttlSeconds?: number;
}): Promise<string> {
	return signAccessToken(await getPrivateKey(), params);
}

/** Verify an MCP access token. Returns null on any failure (route maps null → 401). */
export async function verifyAccessToken(jwt: string): Promise<AccessTokenClaims | null> {
	try {
		return await verifyAccessTokenWith(await getPublicKey(), jwt);
	} catch {
		return null;
	}
}
