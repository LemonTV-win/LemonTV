<script lang="ts">
	import IconParkSolidDelete from '~icons/icon-park-solid/delete';
	import IconParkSolidAdd from '~icons/icon-park-solid/add';
	import { m } from '$lib/paraglide/messages';

	interface Props {
		videos?: Array<{
			type: 'stream' | 'clip' | 'vod';
			platform: 'twitch' | 'youtube' | 'bilibili';
			url: string;
			title: string;
		}>;
	}

	let { videos = $bindable([]) }: Props = $props();

	const videoTypeOptions = ['stream', 'clip', 'vod'];
	const videoPlatformOptions = ['twitch', 'youtube', 'bilibili'];

	function addVideo() {
		videos = [
			...videos,
			{
				type: 'stream',
				platform: 'twitch',
				url: '',
				title: ''
			}
		];
	}

	function removeVideo(index: number) {
		videos = videos.filter((_, i) => i !== index);
	}
</script>

<div class="flex flex-col gap-4">
	{#each videos as video, i}
		<div class="flex flex-col gap-2 rounded-lg border border-slate-700 bg-slate-800 p-4">
			<div class="flex items-center justify-between">
				<h4 class="text-lg font-medium text-slate-300">Video {i + 1}</h4>
				<button
					type="button"
					onclick={() => removeVideo(i)}
					class="text-red-400 hover:text-red-300"
				>
					<IconParkSolidDelete class="h-5 w-5" />
				</button>
			</div>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div class="flex flex-col gap-2">
					<label for={`video-type-${i}`} class="text-sm font-medium text-slate-300">Type</label>
					<select
						id={`video-type-${i}`}
						name={`videos[${i}].type`}
						bind:value={video.type}
						class="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
					>
						{#each videoTypeOptions as type}
							<option value={type}>{type}</option>
						{/each}
					</select>
				</div>
				<div class="flex flex-col gap-2">
					<label for={`video-platform-${i}`} class="text-sm font-medium text-slate-300"
						>Platform</label
					>
					<select
						id={`video-platform-${i}`}
						name={`videos[${i}].platform`}
						bind:value={video.platform}
						class="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
					>
						{#each videoPlatformOptions as platform}
							<option value={platform}>{platform}</option>
						{/each}
					</select>
				</div>
				<div class="flex flex-col gap-2">
					<label for={`video-url-${i}`} class="text-sm font-medium text-slate-300">URL</label>
					<input
						type="text"
						id={`video-url-${i}`}
						name={`videos[${i}].url`}
						bind:value={video.url}
						class="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
						placeholder="https://..."
					/>
				</div>
				<div class="flex flex-col gap-2">
					<label for={`video-title-${i}`} class="text-sm font-medium text-slate-300"
						>Title (Optional)</label
					>
					<input
						type="text"
						id={`video-title-${i}`}
						name={`videos[${i}].title`}
						bind:value={video.title}
						class="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
						placeholder="Video title..."
					/>
				</div>
			</div>
		</div>
	{/each}
	<button
		type="button"
		onclick={addVideo}
		class="flex items-center justify-center gap-2 rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-yellow-500 hover:bg-slate-700"
	>
		<IconParkSolidAdd class="h-5 w-5" />
		{m.add()}
	</button>
</div>
