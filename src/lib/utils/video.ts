import { GOOGLE_API_KEY } from '$env/static/private';

export interface VideoMetadata {
	platform: 'bilibili' | 'youtube' | 'twitch';
	title: string;
	thumbnail: string;
	player: string;
	publishedAt?: string;
}

export async function extractVideoMetadata(url: string): Promise<VideoMetadata> {
	// Bilibili
	const bilibiliMatch = url.match(/bilibili\.com\/video\/([A-Za-z0-9]+)/);
	if (bilibiliMatch) {
		return await extractBilibiliMetadata(bilibiliMatch[1]);
	}

	// YouTube
	const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
	if (youtubeMatch) {
		return await extractYouTubeMetadata(youtubeMatch[1]);
	}

	// Twitch
	const twitchMatch = url.match(/twitch\.tv\/videos\/(\d+)/);
	if (twitchMatch) {
		return await extractTwitchMetadata(twitchMatch[1]);
	}

	throw new Error('Unsupported video URL');
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

export function detectPlatform(url: string): 'bilibili' | 'youtube' | 'twitch' | null {
	if (url.includes('bilibili.com')) return 'bilibili';
	if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
	if (url.includes('twitch.tv')) return 'twitch';
	return null;
}
