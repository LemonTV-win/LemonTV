import { describe, it, expect } from 'bun:test';
import { SignJWT, generateKeyPair, generateSecret } from 'jose';
import { signAccessToken, verifyAccessTokenWith } from './token-core';
import { MCP_RESOURCE, OAUTH_ISSUER } from './config';

const { privateKey, publicKey } = await generateKeyPair('ES256');

describe('access token sign/verify', () => {
	it('round-trips a valid token with the resource audience', async () => {
		const jwt = await signAccessToken(privateKey, {
			sub: 'u1',
			scope: 'mcp:read mcp:write',
			clientId: 'c1'
		});
		const claims = await verifyAccessTokenWith(publicKey, jwt);
		expect(claims.sub).toBe('u1');
		expect(claims.scope).toBe('mcp:read mcp:write');
		expect(claims.clientId).toBe('c1');
		expect(claims.jti.length).toBeGreaterThan(0);
	});

	it('REJECTS a token whose audience is not the MCP resource (the SSO-token defense)', async () => {
		// Mimics the legacy /login/jwt token: same key, but aud = an app origin.
		const ssoLike = await new SignJWT({ scope: 'mcp:write' })
			.setProtectedHeader({ alg: 'ES256', kid: 'lemon-key' })
			.setIssuer(OAUTH_ISSUER)
			.setAudience('https://lemontv.win') // NOT the MCP resource
			.setSubject('u1')
			.setIssuedAt()
			.setExpirationTime('1h')
			.sign(privateKey);
		await expect(verifyAccessTokenWith(publicKey, ssoLike)).rejects.toThrow();
	});

	it('REJECTS a wrong issuer', async () => {
		const badIss = await new SignJWT({ scope: 'mcp:read' })
			.setProtectedHeader({ alg: 'ES256' })
			.setIssuer('https://evil.example')
			.setAudience(MCP_RESOURCE)
			.setSubject('u1')
			.setIssuedAt()
			.setExpirationTime('1h')
			.sign(privateKey);
		await expect(verifyAccessTokenWith(publicKey, badIss)).rejects.toThrow();
	});

	it('REJECTS an HS256 token (algorithm-confusion defense)', async () => {
		const secret = await generateSecret('HS256');
		const hs = await new SignJWT({ scope: 'mcp:write' })
			.setProtectedHeader({ alg: 'HS256' })
			.setIssuer(OAUTH_ISSUER)
			.setAudience(MCP_RESOURCE)
			.setSubject('u1')
			.setIssuedAt()
			.setExpirationTime('1h')
			.sign(secret);
		await expect(verifyAccessTokenWith(publicKey, hs)).rejects.toThrow();
	});

	it('REJECTS an expired token', async () => {
		const expired = await new SignJWT({ scope: 'mcp:read' })
			.setProtectedHeader({ alg: 'ES256' })
			.setIssuer(OAUTH_ISSUER)
			.setAudience(MCP_RESOURCE)
			.setSubject('u1')
			.setIssuedAt(Math.floor(Date.now() / 1000) - 3600)
			.setExpirationTime(Math.floor(Date.now() / 1000) - 60)
			.sign(privateKey);
		await expect(verifyAccessTokenWith(publicKey, expired)).rejects.toThrow();
	});
});
