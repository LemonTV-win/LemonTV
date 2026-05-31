import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
	S3_BUCKET_NAME,
	S3_ACCESS_KEY_ID,
	S3_SECRET_ACCESS_KEY,
	S3_REGION,
	S3_ENDPOINT_URL
} from '$env/static/private';

const s3Client = new S3Client({
	credentials: {
		accessKeyId: S3_ACCESS_KEY_ID,
		secretAccessKey: S3_SECRET_ACCESS_KEY
	},
	region: S3_REGION,
	endpoint: S3_ENDPOINT_URL
});

export async function uploadImage(file: File, key: string): Promise<string> {
	const arrayBuffer = await file.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);

	await s3Client.send(
		new PutObjectCommand({
			Bucket: S3_BUCKET_NAME,
			Key: key,
			Body: buffer,
			ContentType: file.type
		})
	);

	return key;
}

const MAX_INGEST_BYTES = 8 * 1024 * 1024; // 8 MB
const INGEST_TYPE_EXT: Record<string, string> = {
	'image/png': 'png',
	'image/jpeg': 'jpg',
	'image/webp': 'webp',
	'image/gif': 'gif',
	'image/avif': 'avif'
};

/** SSRF guard: reject loopback/private/link-local hosts before fetching a remote URL. */
function isDisallowedHost(hostname: string): boolean {
	const h = hostname.toLowerCase().replace(/^\[|\]$/g, '');
	if (
		h === 'localhost' ||
		h.endsWith('.localhost') ||
		h.endsWith('.internal') ||
		h.endsWith('.local') ||
		h === '::1' ||
		h.startsWith('fe80:') ||
		h.startsWith('fc') ||
		h.startsWith('fd')
	) {
		return true;
	}
	const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
	if (m) {
		const a = Number(m[1]);
		const b = Number(m[2]);
		if (
			a === 10 ||
			a === 127 ||
			a === 0 ||
			(a === 192 && b === 168) ||
			(a === 172 && b >= 16 && b <= 31) ||
			(a === 169 && b === 254)
		) {
			return true;
		}
	}
	return false;
}

/**
 * Fetch a remote image by URL and store it in our S3, returning the storage key.
 * SSRF-guarded: https only, no loopback/private hosts, no redirects, must be an
 * image content-type, size-capped. Lets an MCP/editor edit ingest an external
 * banner into our own storage instead of hotlinking a CDN URL that can rot.
 */
export async function ingestImageUrl(url: string, prefix = 'events'): Promise<string> {
	let parsed: URL;
	try {
		parsed = new URL(url);
	} catch {
		throw new Error(`Invalid image URL: ${url}`);
	}
	if (parsed.protocol !== 'https:') throw new Error('Image URL must be https');
	if (isDisallowedHost(parsed.hostname)) throw new Error('Image URL host is not allowed');

	const res = await fetch(parsed, { redirect: 'error' });
	if (!res.ok) throw new Error(`Failed to fetch image (HTTP ${res.status})`);

	const type = (res.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
	const ext = INGEST_TYPE_EXT[type];
	if (!ext) throw new Error(`Unsupported image content-type: ${type || 'unknown'}`);

	const buffer = Buffer.from(await res.arrayBuffer());
	if (buffer.byteLength > MAX_INGEST_BYTES) {
		throw new Error(`Image too large (max ${MAX_INGEST_BYTES / (1024 * 1024)} MB)`);
	}

	const key = `${prefix}/${crypto.randomUUID()}.${ext}`;
	await s3Client.send(
		new PutObjectCommand({ Bucket: S3_BUCKET_NAME, Key: key, Body: buffer, ContentType: type })
	);
	return key;
}

/** If `value` is an http(s) URL, ingest it into storage and return the key; otherwise return as-is. */
export async function ingestImageIfUrl(value: string): Promise<string> {
	return value.startsWith('http') ? ingestImageUrl(value) : value;
}

export async function getSignedImageUrl(key: string): Promise<string> {
	const command = new GetObjectCommand({
		Bucket: S3_BUCKET_NAME,
		Key: key
	});

	return getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL expires in 1 hour
}

export function processImageURL(url: null | undefined): Promise<null>;
export function processImageURL(url: string): Promise<string>;

export async function processImageURL(url: string | null | undefined): Promise<string | null> {
	if (!url) {
		return null;
	}

	if (url.startsWith('http')) {
		return url;
	}

	return getSignedImageUrl(url);
}
