<script lang="ts">
	import type { PageProps } from './$types';

	import { m } from '$lib/paraglide/messages.js';
	import { onMount } from 'svelte';
	import SearchInput from '$lib/components/SearchInput.svelte';
	import TeamCard from '$lib/components/TeamCard.svelte';
	import ContentActionLink from '$lib/components/ContentActionLink.svelte';
	let { data }: PageProps = $props();

	let search = $state(data.search || '');
	let filtered = $derived(
		data.teams
			.toSorted((a, b) => b.wins - a.wins)
			.map((team, index) => ({ ...team, ranking: index + 1 }))
			.filter((team) => team.name.toLowerCase().includes(search.toLowerCase()))
	);

	let expanded = $state(false);

	$effect(() => {
		window.history.replaceState(
			{},
			'',
			`/teams${search ? `?search=${encodeURIComponent(search)}` : ''}`
		);
	});

	onMount(() => {
		const url = new URL(window.location.href);
		const urlSearch = url.searchParams.get('search');
		if (urlSearch) {
			search = urlSearch;
		}
	});
</script>

<main class="mx-auto max-w-screen-lg md:px-4">
	<div class="flex items-center gap-4">
		<h1 class="my-10 text-2xl font-bold md:mx-0">{m.teams()}</h1>
		{#if ['admin', 'editor'].some((role) => data.user?.roles.includes(role))}
			<ContentActionLink href="/admin/teams" type="edit" />
		{/if}
	</div>

	<div class="mb-4 flex flex-col items-center justify-end gap-2 md:flex-row">
		<SearchInput bind:search filtered={filtered.length} total={data.teams.length} />
	</div>

	<ul class="glass-card-container">
		{#each filtered as team}
			{#if team}
				<TeamCard {team} wins={team.wins} rank={team.ranking} expanded={team.ranking === 1} />
			{/if}
		{/each}
	</ul>
</main>
