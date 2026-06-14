import { json } from '@sveltejs/kit';
import { uploadImage } from '$lib/server/storage';
import { checkPermissions } from '$lib/server/security/permission';

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = new Set([
	'image/png',
	'image/jpeg',
	'image/webp',
	'image/gif',
	'image/avif'
]);

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload an image file
 *     description: Uploads an image file to storage and returns the storage key
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The image file to upload
 *               prefix:
 *                 type: string
 *                 description: Optional prefix for the storage path (defaults to 'uploads')
 *                 example: "avatars"
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadResponse'
 *       400:
 *         description: Bad request - no file provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST({ request, locals }) {
	const permission = checkPermissions(locals, ['admin', 'editor']);
	if (permission.status === 'error') {
		return json({ error: permission.error }, { status: permission.statusCode });
	}

	const formData = await request.formData();
	const file = formData.get('file') as File;
	const prefix = (formData.get('prefix') as string) || 'uploads';

	if (!file) {
		return json({ error: 'No file provided' }, { status: 400 });
	}

	if (!ALLOWED_MIME_TYPES.has(file.type)) {
		return json({ error: `Unsupported file type: ${file.type || 'unknown'}` }, { status: 415 });
	}

	if (file.size > MAX_UPLOAD_BYTES) {
		return json(
			{ error: `File too large (max ${MAX_UPLOAD_BYTES / (1024 * 1024)} MB)` },
			{ status: 413 }
		);
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
