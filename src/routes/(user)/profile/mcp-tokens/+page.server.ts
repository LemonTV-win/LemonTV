import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { checkPermissions } from '$lib/server/security/permission';
import { isMcpTokenScope } from '$lib/server/security/mcp-token';
import {
	createMcpToken,
	listMcpTokens,
	revokeMcpToken
} from '$lib/server/security/mcp-token-store';

const DAY_IN_MS = 1000 * 60 * 60 * 24;
const ALLOWED_EXPIRY_DAYS = new Set([7, 30, 90, 365]);

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		const fullUrl = url.pathname + url.search;
		throw redirect(302, `/login?redirect=${encodeURIComponent(fullUrl)}`);
	}

	// MCP tokens are for authorized editors only.
	if (
		!['admin', 'editor'].some((role) => locals.user!.roles.includes(role as 'admin' | 'editor'))
	) {
		throw redirect(302, '/profile');
	}

	return {
		tokens: await listMcpTokens(locals.user.id)
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const permission = checkPermissions(locals, ['admin', 'editor']);
		if (permission.status === 'error') {
			return fail(permission.statusCode, { error: permission.error });
		}

		const data = await request.formData();
		const name = (data.get('name') as string)?.trim();
		const scope = data.get('scope');
		const expiry = data.get('expiry') as string;

		if (!name) {
			return fail(400, { error: 'A token name is required' });
		}
		if (name.length > 100) {
			return fail(400, { error: 'Token name is too long (max 100 characters)' });
		}
		if (!isMcpTokenScope(scope)) {
			return fail(400, { error: 'Invalid scope' });
		}

		let expiresAt: Date | null = null;
		if (expiry && expiry !== 'never') {
			const days = Number(expiry);
			if (!ALLOWED_EXPIRY_DAYS.has(days)) {
				return fail(400, { error: 'Invalid expiry' });
			}
			expiresAt = new Date(Date.now() + days * DAY_IN_MS);
		}

		try {
			const { token, record } = await createMcpToken({
				userId: permission.userId,
				name,
				scope,
				expiresAt
			});
			// Return the plaintext ONCE; it is never stored or shown again.
			return { created: { token, name: record.name, scope: record.scope } };
		} catch (error) {
			console.error('[MCP] Failed to create token:', error);
			return fail(400, {
				error: error instanceof Error ? error.message : 'Failed to create token'
			});
		}
	},

	revoke: async ({ request, locals }) => {
		const permission = checkPermissions(locals, ['admin', 'editor']);
		if (permission.status === 'error') {
			return fail(permission.statusCode, { error: permission.error });
		}

		const data = await request.formData();
		const id = data.get('id') as string;
		if (!id) {
			return fail(400, { error: 'Missing token id' });
		}

		const revoked = await revokeMcpToken(id, permission.userId);
		if (!revoked) {
			return fail(400, { error: 'Token not found or already revoked' });
		}
		return { revoked: true };
	}
};
