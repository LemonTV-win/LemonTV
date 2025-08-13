<script lang="ts">
	import type { PageProps } from './$types';

	import { m } from '$lib/paraglide/messages.js';
	import { onMount } from 'svelte';
	import SearchInput from '$lib/components/SearchInput.svelte';
	import TeamCard from './TeamCard.svelte';
	import ContentActionLink from '$lib/components/ContentActionLink.svelte';
	import { goto } from '$app/navigation';
	let { data }: PageProps = $props();

	let search = $state(data.search || '');
	let filtered = $derived(
		data.teams
			.toSorted((a, b) => b.wins - a.wins)
			.map((team, index) => ({ ...team, ranking: index + 1 }))
			.filter((team) => team.name.toLowerCase().includes(search.toLowerCase()))
	);

	$inspect('[/teams] data', data);

	$effect(() => {
		const url = new URL(window.location.href);
		if (search) {
			url.searchParams.set('search', search);
		} else {
			url.searchParams.delete('search');
		}
		goto(url.toString(), { replaceState: true, keepFocus: true, noScroll: true });
	});

	onMount(() => {
		const url = new URL(window.location.href);
		const urlSearch = url.searchParams.get('search');
		if (urlSearch) {
			search = urlSearch;
		}
	});
</script>

<main class="mx-auto max-w-screen-lg px-4 md:px-4">
	<div
		class="mt-6 mb-5 flex flex-col gap-3 px-2 sm:flex-row sm:items-center sm:justify-between sm:px-0"
	>
		<div class="flex items-center gap-3 text-white/80">
			<h1 class="text-2xl font-semibold">{m.teams()}</h1>
			{#if ['admin', 'editor'].some((role) => data.user?.roles.includes(role))}
				<ContentActionLink href="/admin/teams" type="edit" />
			{/if}
		</div>

		<div class="flex w-full items-center justify-end sm:w-auto">
			<SearchInput bind:search filtered={filtered.length} total={data.teams.length} />
		</div>
	</div>

	<!-- Divider -->
	<!-- <div class="my-4 h-px w-full bg-white/25"></div> -->

	<ul class="glass-card-container">
		{#each filtered as team (team.id)}
			{#if team}
				<TeamCard {team} wins={team.wins} rank={team.ranking} expanded={team.ranking === 1} />
			{/if}
		{/each}
	</ul>
</main>
