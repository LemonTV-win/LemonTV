import { sequence } from '@sveltejs/kit/hooks';
import * as auth from '$lib/server/auth.js';
import type { Handle, ServerInit } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { syncAll } from '$lib/server/db/sync';
import { dev } from '$app/environment';
import { seed } from '$lib/server/db/seed';
import { LEMON_PUBLIC_JWK_BASE64 } from '$env/static/private';
import { db } from '$lib/server/db';
import { recalculateAllPlayerStats } from '$lib/server/data/stats';

export const init: ServerInit = async () => {
	if (dev) {
		console.info('[ServerInit] Development environment detected');
		console.info('[ServerInit] Syncing database enum tables...');
		await syncAll(db);
		console.info('[ServerInit] Seeding database...');
		await seed();
		console.info('[ServerInit] Recalculating player stats...');
		await recalculateAllPlayerStats(db, {
			snapshotReason: 'deploy'
		});
		console.info('[ServerInit] Player stats recalculated');
	}
};

// OAuth machine endpoints that legitimately receive cross-origin form-encoded
// POSTs from public clients. They carry no ambient cookie credentials (security
// comes from the PKCE code / refresh token), so the origin-CSRF check does not
// apply to them — they are the reason the global check is disabled.
const CSRF_EXEMPT_PATHS = ['/oauth/token', '/oauth/register'];

const FORM_CONTENT_TYPES = [
	'application/x-www-form-urlencoded',
	'multipart/form-data',
	'text/plain'
];

function isFormContentType(request: Request): boolean {
	const ct = (request.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
	return FORM_CONTENT_TYPES.includes(ct);
}

// Re-implements SvelteKit's disabled built-in origin check (turned off globally
// in svelte.config.js so the OAuth endpoints can accept cross-origin form posts).
// This restores identical protection for every OTHER route: a mutating
// form-encoded request whose Origin doesn't match this site is rejected. Mirrors
// upstream by skipping the check in dev.
const handleCsrf: Handle = ({ event, resolve }) => {
	if (dev) return resolve(event);

	const { request, url } = event;
	const mutating =
		request.method === 'POST' ||
		request.method === 'PUT' ||
		request.method === 'PATCH' ||
		request.method === 'DELETE';

	if (mutating && isFormContentType(request) && !CSRF_EXEMPT_PATHS.includes(url.pathname)) {
		const origin = request.headers.get('origin');
		if (origin !== url.origin) {
			return new Response(`Cross-site ${request.method} form submissions are forbidden`, {
				status: 403
			});
		}
	}

	return resolve(event);
};

const handleParaglide: Handle = ({ event, resolve }) => {
	// Skip localization for specific paths
	const excludedPaths = ['/sitemap.xml', '/api/'];
	if (excludedPaths.some((path) => event.url.pathname.startsWith(path))) {
		return resolve(event);
	}

	return paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
		});
	});
};

const handleAuth: Handle = async ({ event, resolve }) => {
	// Define public routes that don't need authentication
	const publicRoutes = [
		'/sitemap.xml',
		'/webmanifest.json',
		'/robots.txt',
		'/.well-known/',
		'/api/public/',
		'/assets/',
		'/images/',
		'/css/',
		'/js/'
	];

	// Static-asset extensions are treated as public — but NOT under /api/,
	// where a key ending in an image extension (e.g. /api/upload/<key>.png)
	// is an authenticated API call, not a static file. Letting the extension
	// shortcut apply there would null out locals.user and break per-route
	// authorization checks for signed-in admins/editors.
	const path = event.url.pathname;
	const staticAssetExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.svg', '.ico'];
	const isStaticAsset =
		!path.startsWith('/api/') && staticAssetExtensions.some((ext) => path.endsWith(ext));

	// Check if this is a public route
	const isPublicRoute =
		isStaticAsset || publicRoutes.some((route) => path === route || path.startsWith(route));

	// Skip authentication for public routes
	if (isPublicRoute) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	// Only run authentication for protected routes
	const sessionToken = event.cookies.get(auth.sessionCookieName);

	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await auth.validateSessionToken(sessionToken);

	if (session) {
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
	} else {
		auth.deleteSessionTokenCookie(event);
	}

	event.locals.user = user;
	event.locals.session = session;
	return resolve(event);
};

const handleJWKS: Handle = ({ event, resolve }) => {
	if (event.url.pathname === '/.well-known/jwks.json') {
		const raw = Buffer.from(LEMON_PUBLIC_JWK_BASE64, 'base64url').toString('utf-8');
		const jwk = JSON.parse(raw);

		return new Response(JSON.stringify({ keys: [jwk] }), {
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
			}
		});
	}

	return resolve(event);
};

export const handle: Handle = sequence(handleCsrf, handleParaglide, handleAuth, handleJWKS);
