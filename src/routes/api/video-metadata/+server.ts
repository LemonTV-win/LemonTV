import { json } from '@sveltejs/kit';

import { GOOGLE_API_KEY } from '$env/static/private';
import type { VideoMetadata } from '$lib/utils/video';

function extractStartTimeFromUrl(url: string): number | undefined {
	const urlObj = new URL(url);

	// YouTube: t parameter (seconds) or time parameter (HH:MM:SS)
	const youtubeTime = urlObj.searchParams.get('t');
	if (youtubeTime) {
		// Handle both seconds and HH:MM:SS format
		if (youtubeTime.includes(':')) {
			const parts = youtubeTime.split(':').map(Number);
			if (parts.length === 2) {
				// MM:SS format
				return parts[0] * 60 + parts[1];
			} else if (parts.length === 3) {
				// HH:MM:SS format
				return parts[0] * 3600 + parts[1] * 60 + parts[2];
			}
		} else {
			// Seconds format
			const seconds = parseInt(youtubeTime);
			if (!isNaN(seconds)) return seconds;
		}
	}

	// YouTube: time parameter (HH:MM:SS)
	const youtubeTimeParam = urlObj.searchParams.get('time');
	if (youtubeTimeParam) {
		const parts = youtubeTimeParam.split(':').map(Number);
		if (parts.length === 2) {
			return parts[0] * 60 + parts[1];
		} else if (parts.length === 3) {
			return parts[0] * 3600 + parts[1] * 60 + parts[2];
		}
	}

	// Bilibili: t parameter (seconds)
	const bilibiliTime = urlObj.searchParams.get('t');
	if (bilibiliTime) {
		const seconds = parseInt(bilibiliTime);
		if (!isNaN(seconds)) return seconds;
	}

	// Twitch: t parameter (seconds)
	const twitchTime = urlObj.searchParams.get('t');
	if (twitchTime) {
		const seconds = parseInt(twitchTime);
		if (!isNaN(seconds)) return seconds;
	}

	return undefined;
}

async function extractBilibiliMetadata(bvid: string): Promise<VideoMetadata> {
	const res = await fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`);
	if (!res.ok) {
		throw new Error('Failed to fetch Bilibili info');
	}

	const data = await res.json();
	if (!data.data) {
		throw new Error('No data from Bilibili');
	}

	return {
		platform: 'bilibili',
		title: data.data.title,
		thumbnail: data.data.pic,
		player: data.data.owner?.name ?? '',
		publishedAt: data.data.pubdate ? new Date(data.data.pubdate * 1000).toISOString() : undefined
	};
}

async function extractYouTubeMetadata(videoId: string): Promise<VideoMetadata> {
	const oembedRes = await fetch(
		`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
	);
	if (!oembedRes.ok) {
		throw new Error('Failed to fetch YouTube info');
	}

	const data = await oembedRes.json();

	// Get publish date from YouTube Data API
	let publishedAt: string | undefined;
	try {
		const apiRes = await fetch(
			`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${GOOGLE_API_KEY}`
		);
		if (apiRes.ok) {
			const apiData = await apiRes.json();
			publishedAt = apiData.items?.[0]?.snippet?.publishedAt;
		}
	} catch (error) {
		console.warn('Failed to fetch YouTube publish date:', error);
	}

	return {
		platform: 'youtube',
		title: data.title,
		thumbnail: data.thumbnail_url,
		player: data.author_name,
		publishedAt
	};
}

async function extractTwitchMetadata(videoId: string): Promise<VideoMetadata> {
	const oembedRes = await fetch(
		`https://api.twitch.tv/v5/oembed?url=https://www.twitch.tv/videos/${videoId}`
	);
	if (!oembedRes.ok) {
		throw new Error('Failed to fetch Twitch info');
	}

	const data = await oembedRes.json();

	// Twitch oembed does not provide publish date; skip for now
	return {
		platform: 'twitch',
		title: data.title,
		thumbnail: data.thumbnail_url,
		player: data.author_name
	};
}
async function extractVideoMetadata(url: string): Promise<VideoMetadata> {
	// Extract start time from URL first
	const startTime = extractStartTimeFromUrl(url);

	// Bilibili
	const bilibiliMatch = url.match(/bilibili\.com\/video\/([A-Za-z0-9]+)/);
	if (bilibiliMatch) {
		const metadata = await extractBilibiliMetadata(bilibiliMatch[1]);
		return { ...metadata, startTime };
	}

	// YouTube
	const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
	if (youtubeMatch) {
		const metadata = await extractYouTubeMetadata(youtubeMatch[1]);
		return { ...metadata, startTime };
	}

	// Twitch
	const twitchMatch = url.match(/twitch\.tv\/videos\/(\d+)/);
	if (twitchMatch) {
		const metadata = await extractTwitchMetadata(twitchMatch[1]);
		return { ...metadata, startTime };
	}

	throw new Error('Unsupported video URL');
}

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
