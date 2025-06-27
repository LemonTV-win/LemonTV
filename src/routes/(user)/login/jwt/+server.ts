import { redirect, json } from '@sveltejs/kit';
import { SignJWT } from 'jose';
import { Buffer } from 'node:buffer';
import { importJWK } from 'jose';
import { dev } from '$app/environment';

const ALLOWED_REDIRECTS = [
	'https://lemonade.strinova.win/auth/callback',
	'https://slice.lemontv.win/auth/callback'
];

export async function GET({ url, locals, cookies }) {
	const redirect_uri = url.searchParams.get('redirect_uri');
	const next = url.searchParams.get('next') ?? '/';

	if (!redirect_uri) {
		return json({ error: 'Missing redirect_uri' }, { status: 400 });
	}

	const isAllowedRedirect = dev ? true : ALLOWED_REDIRECTS.includes(redirect_uri);

	if (!isAllowedRedirect) {
		return json({ error: 'Invalid redirect URI' }, { status: 400 });
	}

	const user = locals.user;
	if (!user) {
		// No active session: redirect to login page (and keep redirect_uri/next)
		const loginUrl = new URL('/login', url.origin);
		loginUrl.searchParams.set(
			'redirect',
			`/login/jwt?redirect_uri=${encodeURIComponent(redirect_uri)}&next=${encodeURIComponent(next)}`
		);
		throw redirect(302, loginUrl.toString());
	}

	// Active session found, generate JWT
	const base64 = process.env.LEMON_PRIVATE_JWK_BASE64!;
	const raw = Buffer.from(base64, 'base64url').toString('utf8');
	const jwk = JSON.parse(raw);
	const privateKey = await importJWK(jwk, 'ES256');

	const jwt = await new SignJWT({
		sub: user.id,
		email: user.email,
		name: user.username,
		roles: user.roles
	})
		.setProtectedHeader({ alg: 'ES256', kid: 'lemon-key' })
		.setIssuer('https://lemontv.com')
		.setAudience(new URL(redirect_uri).origin)
		.setIssuedAt()
		.setExpirationTime('7d') // Longer lifespan OK if HttpOnly and domain-scoped
		.sign(privateKey);

	const redirectUrl = new URL(redirect_uri);
	redirectUrl.searchParams.set('token', jwt);
	redirectUrl.searchParams.set('next', next);

	throw redirect(302, redirectUrl.toString());
}
