import { json } from '@sveltejs/kit';
import { getSignedImageUrl } from '$lib/server/storage';
import { checkPermissions } from '$lib/server/security/permission';

/**
 * @swagger
 * /api/upload/{key}:
 *   get:
 *     summary: Get a signed URL for an uploaded file
 *     description: Generates a signed URL for accessing an uploaded file by its storage key
 *     tags: [Upload]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Storage key/path of the file (can include multiple path segments)
 *         example: "uploads/123e4567-e89b-12d3-a456-426614174000-image.jpg"
 *     responses:
 *       200:
 *         description: Signed URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SignedUrlResponse'
 *       400:
 *         description: Bad request - no key provided
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
