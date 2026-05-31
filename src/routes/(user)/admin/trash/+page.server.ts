import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { checkPermissions } from '$lib/server/security/permission';
import { listDeletedRecords, restoreEntity } from '$lib/server/data/archive';

export const load: PageServerLoad = async ({ locals }) => {
	// The (user)/admin layout already gates admin/editor; restore is moderation.
	const permission = checkPermissions(locals, ['admin', 'editor']);
	if (permission.status === 'error') {
		return { entries: [], error: permission.error };
	}
	return { entries: await listDeletedRecords() };
};

export const actions: Actions = {
	restore: async ({ request, locals }) => {
		const permission = checkPermissions(locals, ['admin', 'editor']);
		if (permission.status === 'error') {
			return fail(permission.statusCode, { error: permission.error });
		}

		const data = await request.formData();
		const entity = data.get('entity') as string;
		const recordId = data.get('recordId') as string;
		if (!entity || !recordId) {
			return fail(400, { error: 'Missing entity or recordId' });
		}

		try {
			const { restored } = await restoreEntity(entity, recordId, permission.userId);
			if (!restored) {
				return fail(400, { error: 'Nothing to restore (already restored or not found)' });
			}
			return { restored: true };
		} catch (error) {
			console.error('[Admin][Trash] Restore failed:', error);
			return fail(500, {
				error: error instanceof Error ? error.message : 'Restore failed'
			});
		}
	}
};
