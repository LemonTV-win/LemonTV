import { json } from '@sveltejs/kit';
import { getSignedImageUrl } from '$lib/server/storage';
import { checkPermissions } from '$lib/server/security/permission';

export async function GET({ params, locals }) {
	const permission = checkPermissions(locals, ['admin', 'editor']);
	if (permission.status === 'error') {
		return json({ error: permission.error }, { status: permission.statusCode });
	}

	const { key } = params;

	if (!key) {
		return json({ error: 'No key provided' }, { status: 400 });
	}

	try {
		const url = await getSignedImageUrl(key);
		return json({ url });
	} catch (e) {
		console.error('[API][Upload] Failed to get signed URL:', e);
		return json({ error: 'Failed to get file URL' }, { status: 500 });
	}
}
