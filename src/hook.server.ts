import type { ServerInit } from '@sveltejs/kit';
import { syncRoles } from '$lib/server/db/sync';

export const init: ServerInit = async () => {
	console.log('[ServerInit] Syncing roles...');
	await syncRoles();
};
