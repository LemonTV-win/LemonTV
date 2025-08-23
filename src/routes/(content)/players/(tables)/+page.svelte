<script lang="ts">
	import type { PageProps } from './$types';

	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import PlayerTable from './PlayerTable.svelte';
	import PlayerFilters from './PlayerFilters.svelte';
	import PageNavigator from '$lib/components/PageNavigator.svelte';
	import { goto } from '$app/navigation';
	import type { TCountryCode } from 'countries-list';
	import type { Character } from '$lib/data/game';

	let { data }: PageProps = $props();

	console.log(`[/players] data:`, data);
	console.log(`[/players] playersAgents keys:`, Object.keys(data.playersAgents || {}));
	console.log(`[/players] players IDs:`, data.players?.map((p) => p.id) || []);
	let selectedNationalities = $state<TCountryCode[]>(data.nationalities || []);
	let selectedSuperstrings = $state<Character[]>(data.superstrings || []);

	let currentPage = $state(data.pagination.currentPage || 1);
	let pageSize = $state(data.pagination.pageSize || 100);

	let sortBy:
		| 'name-abc'
		| 'name-cba'
		| 'wins-asc'
		| 'wins-desc'
		| 'rating-asc'
		| 'rating-desc'
		| 'region-asc'
		| 'region-desc'
		| 'team-asc'
		| 'team-desc'
		| 'kd-asc'
		| 'kd-desc'
		| 'events-asc'
		| 'events-desc' = $state(data.sortBy || 'rating-desc');

	$effect(() => {
		const params = new SvelteURLSearchParams();
		if (sortBy) params.set('sortBy', sortBy);
		if (selectedNationalities.length) params.set('nationalities', selectedNationalities.join(','));
		if (selectedSuperstrings.length) params.set('superstrings', selectedSuperstrings.join(','));
		if (currentPage > 1) params.set('page', currentPage.toString());
		if (pageSize !== 100) params.set('pageSize', pageSize.toString());
		goto(`/players?${params.toString()}`, { replaceState: true, keepFocus: true, noScroll: true });
	});

	// Get unique nationalities and superstrings for filter options
	let uniqueNationalities = $derived([...new Set(data.players.flatMap((p) => p.nationalities))]);
	console.log(`[/players] uniqueNationalities:`, [
		...new Set(data.players.flatMap((p) => p.nationalities))
	]);
	let uniqueSuperstrings = $derived([
		...new Set(
			Object.values(data.playersAgents)
				.filter(Boolean) // Filter out undefined/null values
				.flat()
				.map(([agent]) => agent)
		)
	]);
</script>

<PlayerFilters
	{uniqueNationalities}
	{uniqueSuperstrings}
	bind:selectedNationalities
	bind:selectedSuperstrings
/>

<PlayerTable playersAgents={data.playersAgents || {}} bind:sortBy players={data.players} />

<div class="mt-8">
	<PageNavigator
		currentPage={data.pagination.currentPage}
		totalPages={data.pagination.totalPages}
		bind:pageSize
		onPageChange={(page) => (currentPage = page)}
	/>
</div>
