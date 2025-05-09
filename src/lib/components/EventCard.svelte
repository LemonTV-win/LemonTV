<script lang="ts">
	import type { Event } from '$lib/data/events';
	import { m } from '$lib/paraglide/messages';

	import IconParkSolidCalendar from '~icons/icon-park-solid/calendar';
	import IconParkSolidPeoples from '~icons/icon-park-solid/peoples';
	import IconParkSolidLocalPin from '~icons/icon-park-solid/local-pin';
	import IconParkSolidCheckOne from '~icons/icon-park-solid/check-one';
	import IconParkSolidComputer from '~icons/icon-park-solid/computer';

	let { event, detailed = false }: { event: Event; detailed?: boolean } = $props();
	// TODO:
	// const HOST = page.url.host;
	const HOST = 'lemon.mkpo.li';

	let live = $derived(event.status === 'live');
</script>

<div class="flex flex-col">
	<a
		href="/events/{event.id}"
		class="relative flex min-h-32 flex-col items-center gap-2 border-b-1 border-gray-500 bg-gray-800 shadow-2xl transition-all duration-200 hover:bg-gray-700 sm:flex-row"
	>
		<img src={event.image} alt={event.name} class="w-full max-w-full sm:max-w-64" />
		<div class="flex flex-col p-4">
			<span class="text-xl text-white sm:text-2xl">{event.name}</span>
			{#if detailed}
				<div class="flex gap-4 text-gray-400">
					<span class="flex items-center gap-1">
						<IconParkSolidCalendar class="inline-block h-4 w-4" />
						<time datetime={event.date}>{event.date.replace('/', ' - ')}</time>
					</span>
					<span class="flex items-center gap-1">
						<IconParkSolidPeoples class="inline-block h-4 w-4" />
						<span>{event.participants.length}</span>
					</span>
					<span class="flex items-center gap-1">
						<IconParkSolidLocalPin class="inline-block h-4 w-4" />
						<span>{event.region}</span>
					</span>
					<span class="flex items-center gap-1">
						<IconParkSolidComputer class="inline-block h-4 w-4" />
						<span>
							{#if event.format === 'lan'}
								{m.format_lan()}
							{:else if event.format === 'online'}
								{m.format_online()}
							{:else if event.format === 'hybrid'}
								{m.format_hybrid()}
							{/if}
						</span>
					</span>
					{#if event.official}
						<span class="flex items-center gap-1">
							<IconParkSolidCheckOne class="inline-block h-4 w-4" />
							<span>{m.official()}</span>
						</span>
					{/if}
				</div>
			{/if}
		</div>
		{#if live}
			<span class="absolute top-2 right-2 bg-red-500 px-2 py-1 text-xs text-white">
				{m.live()}
			</span>
		{/if}
	</a>

	{#if live && event.livestreams}
		{#each event.livestreams as livestream}
			{#if livestream.platform === 'twitch'}
				<iframe
					src={`https://player.twitch.tv/?channel=${livestream.url.split('/').pop()}&parent=${HOST}`}
					height="100%"
					width="100%"
					allowfullscreen
					title={`${event.name} - ${livestream.platform}`}
				>
				</iframe>
			{:else if livestream.platform === 'youtube'}
				<!-- TODO: YouTube -->
			{:else if livestream.platform === 'bilibili'}
				<iframe
					src={`https://player.bilibili.com/player.html?bvid=${livestream.url.split('/').pop()}&page=1&high_quality=1&danmaku=0`}
					height="100%"
					width="100%"
					allowfullscreen
					title={`${event.name} - ${livestream.platform}`}
				>
				</iframe>
			{/if}
		{/each}
	{/if}
</div>
