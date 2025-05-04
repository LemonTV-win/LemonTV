<script lang="ts">
	import type { Event } from '$lib/data/events';
	import { m } from '$lib/paraglide/messages';
	import { page } from '$app/state';

	let { event }: { event: Event } = $props();
	// TODO:
	// const HOST = page.url.host;
	const HOST = 'lemon.mkpo.li';

	let live = $derived(event.status === 'live');
</script>

<div class="flex flex-col">
	<a
		href="/events/{event.id}"
		class="relative flex min-h-32 flex-col items-center gap-2 border-b-1 border-gray-500 bg-gray-800 shadow-2xl sm:flex-row"
	>
		<img src={event.image} alt={event.name} class="w-full max-w-full sm:max-w-64" />
		<span class="p-4 text-xl text-white sm:text-2xl">{event.name}</span>
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
			{/if}
		{/each}
	{/if}
</div>
