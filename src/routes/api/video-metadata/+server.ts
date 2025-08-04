import { json } from '@sveltejs/kit';
import { extractVideoMetadata } from '$lib/utils/video';

export async function POST({ request }) {
	try {
		const formData = await request.formData();
		const url = formData.get('url') as string;

		if (!url) {
			return json({ error: 'Missing url' }, { status: 400 });
		}

		const metadata = await extractVideoMetadata(url);
		return json(metadata);
	} catch (error) {
		console.error('[API][VideoMetadata] Failed to extract metadata:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to extract metadata' },
			{ status: 400 }
		);
	}
}
