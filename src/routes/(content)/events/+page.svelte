<script lang="ts">
	import EventCard from '$lib/components/EventCard.svelte';
	import { m } from '$lib/paraglide/messages';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let sortedEvents = $derived(
		data.events.sort((a, b) => {
			return (
				1 * (new Date(b.date.split('/')[0]).getTime() - new Date(a.date.split('/')[0]).getTime())
			);
		})
	);

	let ongoingEvents = $derived(sortedEvents.filter((event) => event.status === 'live'));
	let upcomingEvents = $derived(sortedEvents.filter((event) => event.status === 'upcoming'));
	let finishedEvents = $derived(sortedEvents.filter((event) => event.status === 'finished'));
</script>

<main class="mx-auto max-w-screen-lg md:px-4">
	<h1 class="mx-0 my-10 text-2xl font-bold md:mx-4">Events</h1>

	<ul>
		{#each ongoingEvents as event}
			<li>
				<EventCard {event} detailed />
			</li>
		{/each}
	</ul>

	{#if upcomingEvents.length > 0}
		<h2 class="my-4 text-xl font-bold">{m.upcoming()}</h2>
		<ul class="flex flex-col gap-2">
			{#each upcomingEvents as event}
				<EventCard {event} detailed />
			{/each}
		</ul>
	{/if}

	<h3 class="my-4 text-xl font-bold">{m.finished()}</h3>
	<ul>
		{#each finishedEvents as event}
			<li>
				<EventCard {event} detailed />
			</li>
		{/each}
	</ul>
	<!-- 
  <h2>Ongoing Events</h2>
  
  <h2>Upcoming Events</h2>
  
  <h2>Past Events</h2> -->
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
