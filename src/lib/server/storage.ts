import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { isPrivateIp } from './storage-ssrf';
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

interface FetchedImage {
	buffer: Buffer;
	type: string;
	ext: string;
}

/**
 * GET an https image with SSRF/DoS guards applied: literal-IP hosts must be
 * public (the workerd runtime already refuses connections into private and
 * link-local networks, covering DNS rebinding), redirects are refused, the
 * content-type must be an allowed image, and the size cap is enforced from
 * Content-Length AND while streaming (so the body is never fully buffered
 * first).
 */
async function fetchGuardedImage(parsed: URL): Promise<FetchedImage> {
	const literalHost = parsed.hostname.replace(/^\[|\]$/g, '');
	if (isPrivateIp(literalHost)) {
		throw new Error(`Host ${parsed.hostname} is a non-public address`);
	}

	const res = await fetch(parsed, {
		redirect: 'manual',
		signal: AbortSignal.timeout(15_000)
	});
	if (res.status >= 300 && res.status < 400) {
		res.body?.cancel();
		throw new Error('Image URL redirected; redirects are not allowed');
	}
	if (res.status !== 200) {
		res.body?.cancel();
		throw new Error(`Failed to fetch image (HTTP ${res.status})`);
	}

	const type = (res.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
	const ext = INGEST_TYPE_EXT[type];
	if (!ext) {
		res.body?.cancel();
		throw new Error(`Unsupported image content-type: ${type || 'unknown'}`);
	}

	const tooLarge = `Image too large (max ${MAX_INGEST_BYTES / (1024 * 1024)} MB)`;
	const declared = Number(res.headers.get('content-length'));
	if (Number.isFinite(declared) && declared > MAX_INGEST_BYTES) {
		res.body?.cancel();
		throw new Error(tooLarge);
	}

	const chunks: Uint8Array[] = [];
	let total = 0;
	const reader = res.body?.getReader();
	if (!reader) throw new Error('Image response has no body');
	for (;;) {
		const { done, value } = await reader.read();
		if (done) break;
		total += value.length;
		if (total > MAX_INGEST_BYTES) {
			reader.cancel();
			throw new Error(tooLarge);
		}
		chunks.push(value);
	}
	return { buffer: Buffer.concat(chunks.map((c) => Buffer.from(c))), type, ext };
}

/**
 * Fetch a remote image by URL and store it in our S3, returning the storage key.
 * https only; the fetch is SSRF-hardened (see `fetchGuardedImage`). Lets an
 * MCP/editor edit ingest an external banner into our own storage instead of
 * hotlinking a CDN URL that can rot.
 */
export async function ingestImageUrl(url: string, prefix = 'events'): Promise<string> {
	let parsed: URL;
	try {
		parsed = new URL(url);
	} catch {
		throw new Error(`Invalid image URL: ${url}`);
	}
	if (parsed.protocol !== 'https:') throw new Error('Image URL must be https');

	const { buffer, type, ext } = await fetchGuardedImage(parsed);
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
