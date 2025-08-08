<script lang="ts">
	import EventCard from '$lib/components/EventCard.svelte';
	import { m } from '$lib/paraglide/messages';
	import type { PageProps } from './$types';
	import MaterialSymbolsChevronRightRounded from '~icons/material-symbols/chevron-right-rounded';
	import ContentActionLink from '$lib/components/ContentActionLink.svelte';
	import SearchInput from '$lib/components/SearchInput.svelte';
	import { goto } from '$app/navigation';

	let { data }: PageProps = $props();

	let search = $state(data.searchQuery || '');

	$effect(() => {
		const url = new URL(window.location.href);
		if (search) {
			url.searchParams.set('searchQuery', search);
		} else {
			url.searchParams.delete('searchQuery');
		}
		goto(url.toString(), { replaceState: true, noScroll: true, keepFocus: true });
	});

	let sortedEvents = $derived(
		data.events.sort((a, b) => {
			return (
				1 * (new Date(b.date.split('/')[0]).getTime() - new Date(a.date.split('/')[0]).getTime())
			);
		})
	);

	let filteredEvents = $derived(
		sortedEvents.filter((event) => {
			if (search.length === 0) return true;

			const searchLower = search.toLowerCase();
			return (
				event.name.toLowerCase().includes(searchLower) ||
				event.slug.toLowerCase().includes(searchLower) ||
				event.region.toLowerCase().includes(searchLower) ||
				event.format.toLowerCase().includes(searchLower) ||
				(event.organizers &&
					event.organizers.some((organizer) => organizer.name.toLowerCase().includes(searchLower)))
			);
		})
	);

	let ongoingEvents = $derived(filteredEvents.filter((event) => event.status === 'live'));
	let upcomingEvents = $derived(filteredEvents.filter((event) => event.status === 'upcoming'));
	let finishedEvents = $derived(filteredEvents.filter((event) => event.status === 'finished'));
</script>

<main class="mx-auto max-w-screen-lg md:px-4">
	<div
		class="mt-6 mb-5 flex flex-col gap-3 px-2 sm:flex-row sm:items-center sm:justify-between sm:px-0"
	>
		<div class="flex items-center gap-3 text-white/80">
			<h1 class="text-2xl font-semibold">{m.events()}</h1>
			{#if ['admin', 'editor'].some((role) => data.user?.roles.includes(role))}
				<ContentActionLink href="/admin/events" type="edit" />
				<ContentActionLink href="/admin/matches" type="edit" label={m.edit_matches()} />
			{/if}
		</div>

		<div class="flex w-full items-center justify-end sm:w-auto">
			<SearchInput bind:search filtered={filteredEvents.length} total={sortedEvents.length} />
		</div>
	</div>

	<div class="mb-6 flex justify-end">
		<a href="/organizers" class="flex items-center gap-2 text-gray-400 hover:text-yellow-500">
			<span class="text-sm">{m.view_all_organizers()}</span>
			<MaterialSymbolsChevronRightRounded class="h-4 w-4" />
		</a>
	</div>

	<ul>
		{#each ongoingEvents as event (event.slug)}
			<li>
				<EventCard {event} detailed />
			</li>
		{/each}
	</ul>

	{#if upcomingEvents.length > 0}
		<h2 class="my-4 text-xl font-bold">{m.upcoming()}</h2>
		<ul class="flex flex-col gap-2">
			{#each upcomingEvents as event (event.slug)}
				<EventCard {event} detailed />
			{/each}
		</ul>
	{/if}

	<h2 class="my-4 text-xl font-bold">{m.finished()}</h2>
	<ul class="glass-card-container">
		{#each finishedEvents as event (event.slug)}
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
