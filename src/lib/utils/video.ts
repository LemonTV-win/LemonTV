export interface VideoMetadata {
	platform: 'bilibili' | 'youtube' | 'twitch';
	title: string;
	thumbnail: string;
	player: string;
	publishedAt?: string;
	startTime?: number;
}

const PLATFORM_HOST_PATTERNS: Record<VideoMetadata['platform'], readonly string[]> = {
	bilibili: ['bilibili.com', 'b23.tv'],
	youtube: ['youtube.com', 'youtu.be', 'youtube-nocookie.com'],
	twitch: ['twitch.tv']
};

function hostMatchesSuffix(host: string, suffix: string): boolean {
	return host === suffix || host.endsWith(`.${suffix}`);
}

export function detectPlatform(url: string): 'bilibili' | 'youtube' | 'twitch' | null {
	try {
		const { hostname } = new URL(url.trim());
		const normalizedHost = hostname.toLowerCase();

		for (const [platform, suffixes] of Object.entries(PLATFORM_HOST_PATTERNS)) {
			if (suffixes.some((suffix) => hostMatchesSuffix(normalizedHost, suffix))) {
				return platform as VideoMetadata['platform'];
			}
		}

		return null;
	} catch {
		return null;
	}
}
