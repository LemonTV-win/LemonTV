import { json } from '@sveltejs/kit';
import { uploadImage } from '$lib/server/storage';

export async function POST({ request }) {
	const formData = await request.formData();
	const file = formData.get('file') as File;
	const prefix = (formData.get('prefix') as string) || 'uploads';

	if (!file) {
		return json({ error: 'No file provided' }, { status: 400 });
	}

	try {
		const key = `${prefix}/${crypto.randomUUID()}-${file.name}`;
		await uploadImage(file, key);

		return json({ key });
	} catch (e) {
		console.error('[API][Upload] Failed to upload file:', e);
		return json({ error: 'Failed to upload file' }, { status: 500 });
	}
}
