<script lang="ts">
	import type { PageProps } from './$types';

	import { m } from '$lib/paraglide/messages.js';
	import SearchInput from '$lib/components/SearchInput.svelte';
	import { getAllNames } from '$lib/data/players';
	import ContentActionLink from '$lib/components/ContentActionLink.svelte';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import RegionRanking from './RegionRanking.svelte';
	import PlayerTable from './PlayerTable.svelte';
	import PlayerFilters from './PlayerFilters.svelte';
	import type { TCountryCode } from 'countries-list';
	import type { Character } from '$lib/data/game';

	let { data }: PageProps = $props();

	let search = $state(data.search || '');
	let selectedNationalities = $state<TCountryCode[]>(data.nationalities || []);
	let selectedSuperstrings = $state<Character[]>(data.superstrings || []);
	let activeTab = $state<'players' | 'region-ranking'>(data.activeTab);

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

	let regionSortBy:
		| 'region-asc'
		| 'region-desc'
		| 'players-asc'
		| 'players-desc'
		| 'wins-asc'
		| 'wins-desc'
		| 'rating-asc'
		| 'rating-desc' = $state('players-desc');

	let sorted = $derived(
		data.players.toSorted((a, b) => {
			if (sortBy === 'name-abc') {
				return a.name.localeCompare(b.name);
			} else if (sortBy === 'name-cba') {
				return b.name.localeCompare(a.name);
			} else if (sortBy === 'wins-asc') {
				return a.wins - b.wins;
			} else if (sortBy === 'wins-desc') {
				return b.wins - a.wins;
			} else if (sortBy === 'rating-asc') {
				return a.rating - b.rating;
			} else if (sortBy === 'rating-desc') {
				return b.rating - a.rating;
			} else if (sortBy === 'region-asc') {
				return a.nationalities[0]?.localeCompare(b.nationalities[0] ?? '') ?? 0;
			} else if (sortBy === 'region-desc') {
				return b.nationalities[0]?.localeCompare(a.nationalities[0] ?? '') ?? 0;
			} else if (sortBy === 'team-asc') {
				const aTeams = data.playersTeams[a.id ?? '']?.map((t) => t.name).join(', ') ?? '';
				const bTeams = data.playersTeams[b.id ?? '']?.map((t) => t.name).join(', ') ?? '';
				return aTeams.localeCompare(bTeams);
			} else if (sortBy === 'team-desc') {
				const aTeams = data.playersTeams[a.id ?? '']?.map((t) => t.name).join(', ') ?? '';
				const bTeams = data.playersTeams[b.id ?? '']?.map((t) => t.name).join(', ') ?? '';
				return bTeams.localeCompare(aTeams);
			} else if (sortBy === 'kd-asc') {
				return a.kd - b.kd;
			} else if (sortBy === 'kd-desc') {
				return b.kd - a.kd;
			} else if (sortBy === 'events-asc') {
				return a.eventsCount - b.eventsCount;
			} else if (sortBy === 'events-desc') {
				return b.eventsCount - a.eventsCount;
			}
			return 0;
		})
	);

	let filtered = $derived(
		sorted.filter((player) => {
			const allNames = getAllNames(player);
			const matchesSearch =
				search.length === 0 ||
				allNames.some((name) => name.toLowerCase().includes(search.toLowerCase()));
			const matchesNationality =
				selectedNationalities.length === 0 ||
				player.nationalities.some((nationality) => selectedNationalities.includes(nationality));
			const matchesSuperstring =
				selectedSuperstrings.length === 0 ||
				data.playersAgents[player.id ?? '']?.some(([agent]) =>
					selectedSuperstrings.includes(agent)
				);

			return matchesSearch && matchesNationality && matchesSuperstring;
		})
	);

	$effect(() => {
		const params = new SvelteURLSearchParams();
		if (sortBy) params.set('sortBy', sortBy);
		if (regionSortBy) params.set('regionSortBy', regionSortBy);
		if (activeTab) params.set('activeTab', activeTab);
		if (search) params.set('search', search);
		if (selectedNationalities.length) params.set('nationalities', selectedNationalities.join(','));
		if (selectedSuperstrings.length) params.set('superstrings', selectedSuperstrings.join(','));
		window.history.replaceState({}, '', `/players?${params.toString()}`);
	});

	// Get unique nationalities and superstrings for filter options
	let uniqueNationalities = $derived([...new Set(data.players.flatMap((p) => p.nationalities))]);
	let uniqueSuperstrings = $derived([
		...new Set(
			Object.values(data.playersAgents)
				.flat()
				.map(([agent]) => agent)
		)
	]);
</script>

<main class="mx-auto max-w-screen-lg px-4">
	<div
		class="mt-6 mb-5 flex flex-col gap-3 px-2 sm:flex-row sm:items-center sm:justify-between sm:px-0"
	>
		<div class="flex items-center gap-3 text-white/80">
			<h1 class="text-2xl font-semibold">{m.players()}</h1>
			{#if ['admin', 'editor'].some((role) => data.user?.roles.includes(role))}
				<ContentActionLink href="/admin/players" type="edit" />
			{/if}
		</div>

		<div class="flex w-full items-center justify-end sm:w-auto">
			<SearchInput bind:search filtered={filtered.length} total={sorted.length} />
		</div>
	</div>

	<!-- Divider -->
	<!-- <div class="my-4 h-px w-full bg-white/25"></div> -->

	<!-- Tab Navigation -->
	{#snippet tabButton(active: boolean, onclick: () => void, text: string)}
		<button
			class={[
				'flex-1 border-b-2 px-4 py-2 text-center text-sm font-medium transition-colors',
				active
					? 'border-blue-500 bg-slate-700/50 text-blue-400 backdrop-blur-md'
					: 'border-transparent bg-transparent text-gray-400 backdrop-blur-md'
			]}
			{onclick}
		>
			{text}
		</button>
	{/snippet}

	<div class="mb-6 flex rounded-t-lg border-b border-white/20 bg-slate-800/30">
		{@render tabButton(activeTab === 'players', () => (activeTab = 'players'), m.players())}
		{@render tabButton(
			activeTab === 'region-ranking',
			() => (activeTab = 'region-ranking'),
			m.region_ranking()
		)}
	</div>

	{#if activeTab === 'players'}
		<PlayerFilters
			{uniqueNationalities}
			{uniqueSuperstrings}
			bind:selectedNationalities
			bind:selectedSuperstrings
		/>

		<PlayerTable
			playersTeams={data.playersTeams}
			playersAgents={data.playersAgents}
			{sortBy}
			players={filtered}
		/>
	{/if}

	{#if activeTab === 'region-ranking'}
		<RegionRanking players={data.players} {uniqueNationalities} {regionSortBy} />
	{/if}
</main>
