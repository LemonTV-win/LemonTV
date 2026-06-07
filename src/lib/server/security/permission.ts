import { redirect } from '@sveltejs/kit';
import type { UserRole } from '$lib/data/user';

/**
 * Gate a page `load` by role. Use in admin `+page.server.ts` load functions.
 *
 * - Not signed in → redirect to /login (preserving the target for post-login return).
 * - Signed in but missing the role → redirect to /admin (the dashboard), which is
 *   consistent across all admin pages instead of each one choosing its own target.
 */
export function requirePageRole(
	event: { locals: App.Locals; url: URL },
	requiredRoles: UserRole[]
): void {
	const user = event.locals.user;
	if (!user) {
		const target = event.url.pathname + event.url.search;
		throw redirect(302, `/login?redirect=${encodeURIComponent(target)}`);
	}
	if (!requiredRoles.some((role) => user.roles.includes(role))) {
		throw redirect(302, '/admin');
	}
}

export type PermissionResult =
	| { status: 'success'; userId: string }
	| { status: 'error'; error: string; statusCode: 401 | 403 };

export function checkPermissions(locals: App.Locals, requiredRoles: UserRole[]): PermissionResult {
	if (!locals.user?.id) {
		console.error('[Admin][Players] Unauthorized: user is not authenticated');
		return { status: 'error', error: 'Unauthorized', statusCode: 401 };
	}

	if (!requiredRoles.some((role) => locals.user?.roles.includes(role))) {
		console.error(
			`[Admin][Players] Forbidden: user "${locals.user.username}" (${locals.user.id}) lacks required roles (${requiredRoles.join(', ')}). Current roles: ${locals.user.roles.join(', ')}`
		);
		return { status: 'error', error: 'Insufficient permissions', statusCode: 403 };
	}

	return { status: 'success', userId: locals.user.id };
}
