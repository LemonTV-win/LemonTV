<script lang="ts">
	import type { PageProps } from './$types';

	import { m } from '$lib/paraglide/messages.js';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let { data }: PageProps = $props();

	let sortBy: 'name-abc' | 'name-cba' | 'wins' = $state('name-abc');

	let sorted = $derived(
		data.players.toSorted((a, b) => {
			if (sortBy === 'name-abc') {
				return a.name.localeCompare(b.name);
			} else if (sortBy === 'name-cba') {
				return b.name.localeCompare(a.name);
			} else if (sortBy === 'wins') {
				return b.wins - a.wins;
			}
			return 0;
		})
	);

	$effect(() => {
		goto(`/players?sortBy=${sortBy}`);
	});

	onMount(() => {
		const url = new URL(window.location.href);
		const urlSortBy = url.searchParams.get('sortBy');
		if (
			urlSortBy &&
			(urlSortBy === 'name-abc' || urlSortBy === 'name-cba' || urlSortBy === 'wins')
		) {
			sortBy = urlSortBy;
		}
	});
</script>

<main class="mx-auto max-w-screen-lg">
	<h1 class="my-10 text-2xl font-bold">{m.players()}</h1>

	<table class="w-full table-auto border-collapse border-y-2 border-gray-500 bg-gray-800">
		<thead>
			<tr class="border-b-2 border-gray-500 text-left text-sm text-gray-400">
				<th class="px-4 py-1"
					><button
						class="text-left"
						onclick={() => (sortBy = sortBy === 'name-abc' ? 'name-cba' : 'name-abc')}>Name</button
					></th
				>
				<th class="px-4 py-1"
					><button class="text-left" onclick={() => (sortBy = 'wins')}>{m.wins()}</button></th
				>
			</tr>
		</thead>
		<tbody>
			{#each sorted as player}
				<tr class="border-b-1 border-gray-500 bg-gray-800 px-4 py-2 shadow-2xl">
					<td class="px-4 py-1">
						<a href={`/players/${player.id}`}
							>{player.name}
							{#if player.gameAccounts}
								{#each player.gameAccounts as account}
									{#if account.currentName !== player.name}
										<span class="text-gray-400">
											({account.currentName})
										</span>
									{/if}
								{/each}
							{/if}</a
						>
					</td>
					<td class="px-4 py-1 text-gray-300">{player.wins}</td>
				</tr>
			{/each}
		</tbody>
	</table>
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
