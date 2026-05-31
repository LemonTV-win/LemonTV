import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import https from 'node:https';
import dns from 'node:dns';
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

/**
 * Custom DNS lookup that resolves the host, REJECTS if ANY resolved address is
 * non-public, and otherwise hands a validated address to the socket. Because the
 * value the socket connects to IS the value we validated (one atomic resolve),
 * there is no check-then-connect window — this defeats DNS rebinding, not just a
 * literal private hostname.
 */
function pinnedPublicLookup(
	hostname: string,
	options: dns.LookupOptions,
	callback: (err: NodeJS.ErrnoException | null, address: string, family: number) => void
): void {
	dns.lookup(hostname, { all: true, family: options.family ?? 0 }, (err, addresses) => {
		if (err) return callback(err, '', 0);
		if (addresses.length === 0) {
			return callback(
				new Error(`Could not resolve host: ${hostname}`) as NodeJS.ErrnoException,
				'',
				0
			);
		}
		for (const a of addresses) {
			if (isPrivateIp(a.address)) {
				return callback(
					new Error(`Host ${hostname} resolves to a non-public address`) as NodeJS.ErrnoException,
					'',
					0
				);
			}
		}
		callback(null, addresses[0].address, addresses[0].family);
	});
}

interface FetchedImage {
	buffer: Buffer;
	type: string;
	ext: string;
}

/**
 * GET an https image with all SSRF/DoS guards applied: the connection is pinned
 * to a validated public IP (no rebinding), redirects are refused, the
 * content-type must be an allowed image, and the size cap is enforced from
 * Content-Length AND while streaming (so the body is never fully buffered first).
 */
function fetchGuardedImage(parsed: URL): Promise<FetchedImage> {
	return new Promise<FetchedImage>((resolve, reject) => {
		const req = https.get(
			parsed,
			{ lookup: pinnedPublicLookup, servername: parsed.hostname, timeout: 15_000 },
			(res) => {
				const status = res.statusCode ?? 0;
				const failWith = (msg: string) => {
					res.destroy();
					reject(new Error(msg));
				};
				if (status >= 300 && status < 400)
					return failWith('Image URL redirected; redirects are not allowed');
				if (status !== 200) return failWith(`Failed to fetch image (HTTP ${status})`);

				const type = String(res.headers['content-type'] ?? '')
					.split(';')[0]
					.trim()
					.toLowerCase();
				const ext = INGEST_TYPE_EXT[type];
				if (!ext) return failWith(`Unsupported image content-type: ${type || 'unknown'}`);

				const tooLarge = `Image too large (max ${MAX_INGEST_BYTES / (1024 * 1024)} MB)`;
				const declared = Number(res.headers['content-length']);
				if (Number.isFinite(declared) && declared > MAX_INGEST_BYTES) return failWith(tooLarge);

				const chunks: Buffer[] = [];
				let total = 0;
				res.on('data', (chunk: Buffer) => {
					total += chunk.length;
					if (total > MAX_INGEST_BYTES) return failWith(tooLarge);
					chunks.push(chunk);
				});
				res.on('end', () => resolve({ buffer: Buffer.concat(chunks), type, ext }));
				res.on('error', reject);
			}
		);
		req.on('timeout', () => req.destroy(new Error('Image fetch timed out')));
		req.on('error', reject);
	});
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
