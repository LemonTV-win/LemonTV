/**
 * MCP access-token signing/verification — pure core.
 *
 * Takes keys as parameters (no env/SvelteKit imports) so it is unit-testable
 * with a generated key pair. Env-bound wrappers live in `./token.ts`.
 *
 * The security-critical invariant: every token's `aud` is the MCP resource, and
 * verification PINS the algorithm to ES256 and REQUIRES issuer + audience ===
 * the MCP resource. This is what keeps these tokens from being confused with the
 * legacy /login/jwt SSO tokens (different `aud`) even though both use one key.
 */
import { SignJWT, jwtVerify } from 'jose';
import { randomUUID } from 'node:crypto';
import { OAUTH_ISSUER, MCP_RESOURCE, JWT_ALG, JWT_KID, ACCESS_TOKEN_TTL_SECONDS } from './config';

type SignKey = Parameters<InstanceType<typeof SignJWT>['sign']>[0];
type VerifyKey = CryptoKey | Uint8Array;

export interface AccessTokenClaims {
	sub: string;
	scope: string;
	clientId: string;
	jti: string;
}

export async function signAccessToken(
	privateKey: SignKey,
	params: { sub: string; scope: string; clientId: string; jti?: string; ttlSeconds?: number }
): Promise<string> {
	const jti = params.jti ?? randomUUID();
	const ttl = params.ttlSeconds ?? ACCESS_TOKEN_TTL_SECONDS;
	return new SignJWT({ scope: params.scope, azp: params.clientId, client_id: params.clientId })
		.setProtectedHeader({ alg: JWT_ALG, kid: JWT_KID })
		.setIssuer(OAUTH_ISSUER)
		.setAudience(MCP_RESOURCE)
		.setSubject(params.sub)
		.setJti(jti)
		.setIssuedAt()
		.setExpirationTime(`${ttl}s`)
		.sign(privateKey);
}

/** Verify a token. Throws (jose) on bad signature, wrong alg/issuer/audience, or expiry. */
export async function verifyAccessTokenWith(
	publicKey: VerifyKey,
	jwt: string
): Promise<AccessTokenClaims> {
	const { payload } = await jwtVerify(jwt, publicKey, {
		algorithms: [JWT_ALG], // pin ES256 — reject none/HS256/RS256 (alg-confusion defense)
		issuer: OAUTH_ISSUER,
		audience: MCP_RESOURCE, // resource binding — throws on mismatch
		requiredClaims: ['sub', 'scope', 'exp', 'iat']
	});
	return {
		sub: payload.sub as string,
		scope: typeof payload.scope === 'string' ? payload.scope : '',
		clientId: (payload.azp ?? payload.client_id ?? '') as string,
		jti: (payload.jti ?? '') as string
	};
}
