import { json, redirect } from '@sveltejs/kit';
import { importJWK, SignJWT } from 'jose';
import { Buffer } from 'node:buffer';

const ALLOWED_REDIRECTS = [
	'https://lemonade.strinova.win/auth/callback',
	'https://nade.lemontv.win/auth/callback',
	'https://lemonade.mkpo.li/auth/callback',
	'https://slice.lemontv.win/auth/callback'
];

export async function POST({ request }) {
	const { email, userId, redirect_uri, next } = await request.json();

	if (!ALLOWED_REDIRECTS.includes(redirect_uri)) {
		return json({ error: 'Invalid redirect URI' }, { status: 400 });
	}

	const base64 = process.env.LEMON_PRIVATE_JWK_BASE64!;
	const raw = Buffer.from(base64, 'base64url').toString('utf8');
	const jwk = JSON.parse(raw);
	const privateKey = await importJWK(jwk, 'ES256');

	const jwt = await new SignJWT({ sub: userId, email })
		.setProtectedHeader({ alg: 'ES256', kid: 'lemon-key' })
		.setIssuer('https://lemontv.com')
		.setAudience(new URL(redirect_uri).origin)
		.setIssuedAt()
		.setExpirationTime('15m')
		.sign(privateKey);

	// Append token to redirect URI
	const redirectUrl = new URL(redirect_uri);
	redirectUrl.searchParams.set('token', jwt);

	if (next) {
		redirectUrl.searchParams.set('next', next);
	}

	throw redirect(302, redirectUrl.toString());
}
