<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import type { PageProps } from './$types';
	import { goto } from '$app/navigation';
	import MaterialSymbolsSearchRounded from '~icons/material-symbols/search-rounded';
	import EventButtonCard from './EventButtonCard.svelte';
	let { data }: PageProps = $props();

	let searchQuery = $state(data.searchQuery ?? '');
	function handleEventClick(eventId: string) {
		goto(`/admin/matches/${eventId}`);
	}

	// Filter events based on search query
	let filteredEvents = $derived(
		data.events.filter((event) => {
			if (!searchQuery) return true;
			const query = searchQuery.toLowerCase();
			return (
				event.name.toLowerCase().includes(query) ||
				event.slug.toLowerCase().includes(query) ||
				event.server.toLowerCase().includes(query) ||
				event.region.toLowerCase().includes(query)
			);
		})
	);

	// // Convert eventsByEvent to array and filter based on search query
	// let filteredEvents = $derived(
	// 	Object.values(data.events as Record<string, EventData>)
	// 		.filter((eventData) => {
	// 			const searchLower = searchQuery.toLowerCase();
	// 			return (
	// 				eventData.event.name.toLowerCase().includes(searchLower) ||
	// 				eventData.event.slug.toLowerCase().includes(searchLower) ||
	// 				Object.values(eventData.stages).some((stage) =>
	// 					stage.matches.some((match) => match.id.toLowerCase().includes(searchLower))
	// 				)
	// 			);
	// 		})
	// 		.map((eventData) => eventData.event)
	// );

	// Sync searchQuery changes to URL
	$effect(() => {
		const url = new URL(window.location.href);
		if (searchQuery) {
			url.searchParams.set('searchQuery', searchQuery);
		} else {
			url.searchParams.delete('searchQuery');
		}
		goto(url.toString(), { replaceState: true, noScroll: true, keepFocus: true });
	});
</script>

<svelte:head>
	<title>{m.matches()} | {m.admin_panel()} | LemonTV</title>
</svelte:head>

<div class="mx-auto max-w-7xl p-4">
	<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<h1 class="text-2xl font-bold">{m.matches()}</h1>
		<div>{m.select_event_to_view_matches()}</div>
		<div class="flex flex-col gap-4 sm:flex-row">
			<div class="relative">
				<MaterialSymbolsSearchRounded
					class="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400"
				/>
				<input
					type="text"
					bind:value={searchQuery}
					placeholder={m.search_events()}
					class="w-full rounded-lg border border-gray-700 bg-gray-800 py-2 pr-4 pl-10 text-white placeholder-gray-400 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none"
				/>
			</div>
		</div>
	</div>
	<!-- <div
		class="styled-scroll mb-8 grid max-h-[calc(3*theme(spacing.20)+2*theme(spacing.4))] gap-4 overflow-y-auto pr-4 md:grid-cols-2 lg:grid-cols-3"
	>
		{#each filteredEvents as event (event.id)}
			<EventButtonCard {event} {handleEventSelect} bind:selectedEventId />
		{/each}
	</div> -->

	<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each filteredEvents as event (event.id)}
			<EventButtonCard {event} onSelect={handleEventClick} />
		{/each}
	</div>

	{#if filteredEvents.length === 0}
		<div class="rounded-lg border border-gray-700 bg-gray-800 p-8 text-center text-gray-400">
			<p>
				{searchQuery
					? 'No events match your search.'
					: 'No events found. Create an event first to manage matches.'}
			</p>
		</div>
	{/if}
</div>
