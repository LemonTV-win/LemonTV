<script lang="ts">
	import type { PageProps } from './$types';

	import { m } from '$lib/paraglide/messages.js';
	import SearchInput from '$lib/components/SearchInput.svelte';
	import TeamCard from '$lib/components/TeamCard.svelte';

	let { data }: PageProps = $props();

	let search = $state('');
	let filtered = $derived(
		data.teams
			.toSorted((a, b) => b.wins - a.wins)
			.filter((team) => team.name.toLowerCase().includes(search.toLowerCase()))
	);

	let expanded = $state(false);
</script>

<main class="mx-auto max-w-screen-lg">
	<h1 class="my-10 text-2xl font-bold">{m.teams()}</h1>

	<div class="mb-4 flex items-center justify-end gap-2">
		<SearchInput bind:search filtered={filtered.length} total={data.teams.length} />
	</div>

	<ul>
		{#each filtered as team, i}
			{#if team}
				<TeamCard {team} wins={team.wins} rank={i + 1} />
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
