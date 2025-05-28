import { json } from '@sveltejs/kit';
import { getSignedImageUrl } from '$lib/server/storage';

export async function GET({ params }) {
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
