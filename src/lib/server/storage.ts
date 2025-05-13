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

export async function getSignedImageUrl(key: string): Promise<string> {
	const command = new GetObjectCommand({
		Bucket: S3_BUCKET_NAME,
		Key: key
	});

	return getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL expires in 1 hour
}

export async function processImageURL(url: string): Promise<string> {
	if (url.startsWith('http')) {
		return url;
	}

	return getSignedImageUrl(url);
}
