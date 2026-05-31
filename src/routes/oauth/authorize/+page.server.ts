/**
 * OAuth /authorize — the browser-facing consent step (RFC 6749 §4.1.1 + PKCE).
 *
 * load() validates the request, requires a logged-in session (bouncing through
 * /login?redirect=… otherwise), and renders consent. The approve/deny actions
 * RE-VALIDATE every parameter against the registered client (hidden fields are
 * untrusted) before issuing a code or redirecting — so tampering the form can
 * never widen scope, change audience, or redirect a code to an attacker.
 */
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { dev } from '$app/environment';
import {
	checkAuthorizeParams,
	buildRedirect,
	type AuthorizeParams
} from '$lib/server/oauth/authorize-core';
import { getClient, clientRedirectUris, issueAuthCode } from '$lib/server/oauth/store';
import { safeInternalPath } from '$lib/server/oauth/redirect';

const CSRF_COOKIE = 'oauth_consent_csrf';

function paramsFromSearch(searchParams: URLSearchParams): AuthorizeParams {
	return {
		responseType: searchParams.get('response_type'),
		clientId: searchParams.get('client_id'),
		redirectUri: searchParams.get('redirect_uri'),
		codeChallenge: searchParams.get('code_challenge'),
		codeChallengeMethod: searchParams.get('code_challenge_method'),
		scope: searchParams.get('scope'),
		state: searchParams.get('state'),
		resource: searchParams.get('resource')
	};
}

async function resolveCheck(params: AuthorizeParams) {
	const client = params.clientId ? await getClient(params.clientId) : null;
	const registered = client ? clientRedirectUris(client) : [];
	return { client, check: checkAuthorizeParams(params, registered) };
}

export const load: PageServerLoad = async ({ url, locals, cookies }) => {
	const params = paramsFromSearch(url.searchParams);
	const { client, check } = await resolveCheck(params);

	if (check.status === 'invalid') {
		return { ok: false as const, message: check.description };
	}
	if (check.status === 'redirect_error') {
		throw redirect(
			302,
			buildRedirect(check.redirectUri, {
				error: check.error,
				error_description: check.description,
				state: check.state
			})
		);
	}

	// Valid request — now require a logged-in user.
	if (!locals.user) {
		const back = safeInternalPath(url.pathname + url.search, '/');
		throw redirect(302, `/login?redirect=${encodeURIComponent(back)}`);
	}

	// Double-submit CSRF token for the consent POST.
	const csrf = crypto.randomUUID();
	cookies.set(CSRF_COOKIE, csrf, {
		path: '/oauth',
		httpOnly: true,
		secure: !dev,
		sameSite: 'lax',
		maxAge: 600
	});

	return {
		ok: true as const,
		csrf,
		username: locals.user.username,
		clientName: client?.clientName ?? null,
		clientId: params.clientId,
		clientUri: client?.clientUri ?? null,
		scopes: check.scopes,
		// Echoed back as hidden fields; the actions re-validate them, so they are
		// not trusted — they exist only to survive the POST round-trip.
		fields: {
			response_type: 'code',
			client_id: params.clientId ?? '',
			redirect_uri: check.redirectUri,
			code_challenge: check.codeChallenge,
			code_challenge_method: 'S256',
			scope: check.scope,
			state: check.state ?? '',
			resource: check.resource
		}
	};
};

function paramsFromForm(form: FormData): AuthorizeParams {
	const s = (k: string) => {
		const v = form.get(k);
		return typeof v === 'string' && v.length > 0 ? v : null;
	};
	return {
		responseType: s('response_type'),
		clientId: s('client_id'),
		redirectUri: s('redirect_uri'),
		codeChallenge: s('code_challenge'),
		codeChallengeMethod: s('code_challenge_method'),
		scope: s('scope'),
		state: s('state'),
		resource: s('resource')
	};
}

function checkCsrf(form: FormData, cookies: import('@sveltejs/kit').Cookies): boolean {
	const cookie = cookies.get(CSRF_COOKIE);
	const field = form.get('csrf');
	return !!cookie && typeof field === 'string' && field === cookie;
}

export const actions: Actions = {
	approve: async ({ request, locals, cookies }) => {
		const form = await request.formData();
		if (!locals.user)
			return { ok: false as const, message: 'Your session expired. Please sign in again.' };
		if (!checkCsrf(form, cookies))
			return { ok: false as const, message: 'Invalid request (CSRF). Please retry.' };

		const params = paramsFromForm(form);
		const { check } = await resolveCheck(params);
		if (check.status === 'invalid') return { ok: false as const, message: check.description };
		if (check.status === 'redirect_error') {
			throw redirect(
				302,
				buildRedirect(check.redirectUri, {
					error: check.error,
					error_description: check.description,
					state: check.state
				})
			);
		}

		const code = await issueAuthCode({
			clientId: params.clientId!,
			userId: locals.user.id,
			redirectUri: check.redirectUri,
			codeChallenge: check.codeChallenge,
			scope: check.scope,
			resource: check.resource
		});
		cookies.delete(CSRF_COOKIE, { path: '/oauth' });
		throw redirect(302, buildRedirect(check.redirectUri, { code, state: check.state }));
	},

	deny: async ({ request, cookies }) => {
		const form = await request.formData();
		const params = paramsFromForm(form);
		const { check } = await resolveCheck(params);
		cookies.delete(CSRF_COOKIE, { path: '/oauth' });
		// Only redirect to a re-validated redirect_uri; otherwise show the error page.
		if (check.status === 'invalid') return { ok: false as const, message: 'Authorization denied.' };
		throw redirect(
			302,
			buildRedirect(check.redirectUri, { error: 'access_denied', state: check.state })
		);
	}
};
