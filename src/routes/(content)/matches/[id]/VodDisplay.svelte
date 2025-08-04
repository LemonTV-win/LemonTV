<!-- @migration-task Error while migrating Svelte code: `$:` is not allowed in runes mode, use `$derived` or `$effect` instead
https://svelte.dev/e/legacy_reactive_statement_invalid -->
<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import IconParkSolidPlay from '~icons/icon-park-solid/play';
	import IconParkOutlineLink from '~icons/icon-park-outline/link';
	import IconEyeOff from '~icons/lucide/eye-off';
	import IconVideo from '~icons/lucide/video';

	let {
		vods,
		gameId,
		mapName
	}: {
		vods: Array<{
			url: string;
			type: 'main' | 'sub' | 'restream' | 'pov' | 'archive' | 'clip' | 'analysis';
			playerId?: string;
			teamId?: string;
			language?: string;
			platform?: 'youtube' | 'bilibili' | 'twitch';
			title?: string;
			official: boolean;
			startTime?: number;
			available: boolean;
			createdAt: Date;
			updatedAt: Date;
		}>;
		gameId: number;
		mapName: string;
	} = $props();

	// Filter VODs to only show available ones
	let availableVods = $derived(vods.filter((vod) => vod.available));

	// Group VODs by type for better organization
	let vodsByType = $derived(
		availableVods.reduce(
			(acc, vod) => {
				if (!acc[vod.type]) {
					acc[vod.type] = [];
				}
				acc[vod.type].push(vod);
				return acc;
			},
			{} as Record<string, typeof availableVods>
		)
	);

	// Type labels for display
	const typeLabels = {
		main: 'Main Stream',
		sub: 'Secondary Stream',
		restream: 'Restream',
		pov: 'Player POV',
		archive: 'Archive',
		clip: 'Highlights',
		analysis: 'Analysis'
	};

	// Sort VODs by type priority
	const priority = {
		main: 1,
		sub: 2,
		restream: 3,
		pov: 4,
		archive: 5,
		clip: 6,
		analysis: 7
	};

	function isYouTubeUrl(url: string): boolean {
		return url?.includes('youtube.com') || url?.includes('youtu.be') || false;
	}

	function getYouTubeEmbedUrl(url: string): string {
		// Extract video ID from YouTube URL
		const videoIdMatch = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
		if (videoIdMatch) {
			return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
		}
		return url || '';
	}

	function isTwitchUrl(url: string): boolean {
		return url?.includes('twitch.tv') || false;
	}

	function getTwitchEmbedUrl(url: string): string {
		// Extract video ID from Twitch URL
		const videoIdMatch = url?.match(/twitch\.tv\/videos\/(\d+)/);
		if (videoIdMatch) {
			return `https://player.twitch.tv/?video=v${videoIdMatch[1]}&parent=${window.location.hostname}`;
		}
		return url || '';
	}

	function canEmbed(url: string): boolean {
		return isYouTubeUrl(url) || isTwitchUrl(url);
	}

	function getEmbedUrl(url: string): string {
		if (isYouTubeUrl(url)) {
			return getYouTubeEmbedUrl(url);
		}
		if (isTwitchUrl(url)) {
			return getTwitchEmbedUrl(url);
		}
		return url || '';
	}

	function formatDuration(seconds?: number): string {
		if (!seconds) return '';
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;
		return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}
</script>

{#if availableVods && availableVods.length > 0}
	<div class="mt-6 max-w-2xl space-y-4">
		<h3 class="flex items-center gap-2 text-lg font-semibold text-white">
			<IconVideo class="h-4 w-4" />
			{m.vods()} - {mapName}
		</h3>

		<div class="flex gap-3">
			{#each availableVods.sort((a, b) => {
				return (priority[a.type as keyof typeof priority] || 999) - (priority[b.type as keyof typeof priority] || 999);
			}) as vod, index}
				{#if vod.url}
					<div class="glass min-w-128 p-4">
						<div class="mb-3 flex items-center justify-between">
							<div class="flex items-center gap-2">
								<IconParkSolidPlay class="h-4 w-4 text-gray-400" />
								<span class="rounded bg-gray-700 px-2 py-1 text-xs text-gray-300">
									{typeLabels[vod.type as keyof typeof typeLabels] || vod.type}
								</span>
								{#if vod.official}
									<span class="rounded bg-gray-600 px-2 py-1 text-xs text-gray-300">Official</span>
								{/if}
							</div>
							<div class="text-xs text-gray-500">
								{new Date(vod.createdAt).toLocaleDateString()}
							</div>
						</div>

						{#if vod.title}
							<div class="mb-2 text-sm font-medium text-white">
								{vod.title}
							</div>
						{/if}

						<div class="mb-2 flex flex-wrap gap-2 text-xs">
							{#if vod.language}
								<span class="rounded bg-gray-700 px-2 py-1 text-gray-300">
									{vod.language}
								</span>
							{/if}
							{#if vod.platform}
								<span class="rounded bg-gray-700 px-2 py-1 text-gray-300">
									{vod.platform}
								</span>
							{/if}
							{#if vod.startTime}
								<span class="rounded bg-gray-700 px-2 py-1 text-gray-300">
									{formatDuration(vod.startTime)}
								</span>
							{/if}
						</div>

						{#if canEmbed(vod.url)}
							<div class="mb-3">
								<iframe
									src={getEmbedUrl(vod.url)}
									class="h-48 w-full rounded border-0"
									allowfullscreen
									title="Game VOD"
								></iframe>
							</div>
						{:else}
							<div class="mb-3 rounded bg-gray-900 p-3">
								<div class="flex items-center gap-2 text-sm text-gray-400">
									<IconParkOutlineLink class="h-4 w-4" />
									<span>External VOD</span>
								</div>
							</div>
						{/if}

						<a
							href={vod.url}
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
						>
							<IconParkOutlineLink class="h-4 w-4" />
							{m.watch_on_platform()}
						</a>
					</div>
				{/if}
			{/each}
		</div>
	</div>
{:else if vods && vods.length > 0}
	<div class="mt-6 max-w-2xl">
		<div class="glass p-4">
			<div class="flex items-center gap-2 text-gray-400">
				<IconEyeOff class="h-4 w-4" />
				<span>No VODs available for this game</span>
			</div>
		</div>
	</div>
{:else}
	<div class="mt-6 max-w-2xl">
		<div class="glass p-4">
			<div class="flex items-center gap-2 text-gray-400">
				<IconEyeOff class="h-4 w-4" />
				<span>No VODs found for this game</span>
			</div>
		</div>
	</div>
{/if}
