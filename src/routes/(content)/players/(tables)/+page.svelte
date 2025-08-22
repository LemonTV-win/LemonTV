<script lang="ts">
	import type { PageProps } from './$types';

	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import PlayerTable from './PlayerTable.svelte';
	import PlayerFilters from './PlayerFilters.svelte';
	import type { TCountryCode } from 'countries-list';
	import type { Character } from '$lib/data/game';

	let { data }: PageProps = $props();

	let selectedNationalities = $state<TCountryCode[]>(data.nationalities || []);
	let selectedSuperstrings = $state<Character[]>(data.superstrings || []);

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
				const aTeams = a.teams.map((t) => t.name).join(', ') ?? '';
				const bTeams = b.teams.map((t) => t.name).join(', ') ?? '';
				return aTeams.localeCompare(bTeams);
			} else if (sortBy === 'team-desc') {
				const aTeams = a.teams.map((t) => t.name).join(', ') ?? '';
				const bTeams = b.teams.map((t) => t.name).join(', ') ?? '';
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
				searchQuery.length === 0 ||
				allNames.some((name) => name.toLowerCase().includes(searchQuery.toLowerCase()));
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

<PlayerFilters
	{uniqueNationalities}
	{uniqueSuperstrings}
	bind:selectedNationalities
	bind:selectedSuperstrings
/>

<PlayerTable playersAgents={data.playersAgents} bind:sortBy players={data.players} />
