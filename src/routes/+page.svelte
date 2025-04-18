<script lang="ts">
	import EventCard from '$lib/components/EventCard.svelte';
	import { m } from '$lib/paraglide/messages';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<main class="mx-auto max-w-screen-lg">
	<h2 class="my-10 text-2xl font-bold">{m.events()}</h2>
	<ul>
		{#each data.events as event}
			{#if event.status !== 'upcoming'}
				<li>
					<EventCard {event} />
				</li>
			{/if}
		{/each}
	</ul>
	<h3 class="my-10 text-xl font-bold">{m.upcoming()}</h3>
	<ul>
		{#each data.events as event}
			{#if event.status === 'upcoming'}
				<li>
					<a
						href="/events/{event.id}"
						class="flex items-center gap-2 border-b-1 border-gray-500 bg-gray-800 shadow-2xl"
					>
						<img src={event.image} alt={event.name} class="w-full max-w-64" />
						<span class="p-4 text-2xl text-white">{event.name}</span>
					</a>
				</li>
			{/if}
		{/each}
	</ul>
</main>

<style>
	:global(body) {
		background-image:
			linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 1)),
			url(https://klbq-web-cms.strinova.com/prod/strinova_web/images/202411/430c6088-8945-4472-9f79-59a32875b96c.jpg);
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		min-height: 100dvh;
	}
</style>
