export interface VideoMetadata {
	platform: 'bilibili' | 'youtube' | 'twitch';
	title: string;
	thumbnail: string;
	player: string;
	publishedAt?: string;
	startTime?: number;
}

export function detectPlatform(url: string): 'bilibili' | 'youtube' | 'twitch' | null {
	if (url.includes('bilibili.com')) return 'bilibili';
	if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
	if (url.includes('twitch.tv')) return 'twitch';
	return null;
}
