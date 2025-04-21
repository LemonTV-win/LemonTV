<script lang="ts">
	import type { PageProps } from './$types';

	import { m } from '$lib/paraglide/messages.js';
	import SearchInput from '$lib/components/SearchInput.svelte';

	let { data }: PageProps = $props();

	let search = $state('');
	let filtered = $derived(
		data.teams
			.toSorted((a, b) => b.wins - a.wins)
			.filter((team) => team.name.toLowerCase().includes(search.toLowerCase()))
	);
</script>

<main class="mx-auto max-w-screen-lg">
	<h1 class="my-10 text-2xl font-bold">{m.teams()}</h1>

	<div class="mb-4 flex items-center justify-end gap-2">
		<SearchInput bind:search filtered={filtered.length} total={data.teams.length} />
	</div>

	<ul>
		{#each filtered as team, i}
			{#if team}
				<li class="border-b-1 border-gray-500 bg-gray-800 p-4 shadow-2xl">
					<div class="mb-8 flex items-center gap-4">
						<span
							class={[
								'flex h-8 w-8 items-center justify-center bg-gray-700 text-sm text-gray-400',
								i === 0 && 'bg-yellow-500 text-white',
								i === 1 && 'bg-neutral-500 text-white',
								i === 2 && 'bg-red-500 text-white'
							]}
						>
							{i + 1}</span
						>
						<div class="flex w-full justify-between">
							<a href={`/teams/${team.id}`} class="text-2xl font-bold">{team.name}</a>
							<p class="text-gray-400">
								<span class="text-yellow-500">{team.wins}</span> wins
							</p>
						</div>
					</div>
					{#if team.players}
						<ul class="grid grid-cols-3 gap-4 p-4">
							{#each team.players as player}
								<li>
									{#if player}
										<a href={`/players/${player.id}`}>{player.name}</a>
									{/if}
								</li>
							{/each}
						</ul>
					{/if}
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
