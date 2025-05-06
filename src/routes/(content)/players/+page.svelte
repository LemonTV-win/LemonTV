<script lang="ts">
	import type { PageProps } from './$types';

	import { m } from '$lib/paraglide/messages.js';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import CharacterIcon from '$lib/components/CharacterIcon.svelte';
	import TypcnArrowUnsorted from '~icons/typcn/arrow-unsorted';
	import TypcnArrowSortedDown from '~icons/typcn/arrow-sorted-down';
	import TypcnArrowSortedUp from '~icons/typcn/arrow-sorted-up';
	import SearchInput from '$lib/components/SearchInput.svelte';
	import { getAllNames } from '$lib/data/players';

	let { data }: PageProps = $props();

	let search = $state('');
	let sortBy: 'name-abc' | 'name-cba' | 'wins-asc' | 'wins-desc' | 'rating-asc' | 'rating-desc' =
		$state('name-abc');

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
			}
			return 0;
		})
	);
	let filtered = $derived(
		sorted.filter((player) => {
			return player.name.toLowerCase().includes(search.toLowerCase());
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
			(urlSortBy === 'name-abc' ||
				urlSortBy === 'name-cba' ||
				urlSortBy === 'wins-asc' ||
				urlSortBy === 'wins-desc' ||
				urlSortBy === 'rating-asc' ||
				urlSortBy === 'rating-desc')
		) {
			sortBy = urlSortBy;
		}
	});
</script>

<svelte:head>
	<title>{m.players()} | LemonTV</title>
</svelte:head>

<main class="mx-auto max-w-screen-lg px-4">
	<h1 class="my-10 text-2xl font-bold">{m.players()}</h1>

	<div class="mb-4 flex flex-col items-center justify-end gap-2 sm:flex-row">
		<SearchInput bind:search filtered={filtered.length} total={sorted.length} />
	</div>

	<div class="overflow-x-auto">
		<table class="w-full table-auto border-collapse border-y-2 border-gray-500 bg-gray-800">
			<thead>
				<tr class="border-b-2 border-gray-500 text-left text-sm text-gray-400">
					<th class="px-4 py-1">
						<button
							class="text-left"
							onclick={() => (sortBy = sortBy === 'name-abc' ? 'name-cba' : 'name-abc')}
							>{m.name()}
							{#if sortBy === 'name-abc'}
								<TypcnArrowSortedUp class="inline-block" />
							{:else if sortBy === 'name-cba'}
								<TypcnArrowSortedDown class="inline-block" />
							{:else}
								<TypcnArrowUnsorted class="inline-block" />
							{/if}
						</button>
					</th>
					<th class="px-4 py-1">{m.teams()}</th>
					<th class="hidden px-4 py-1 sm:table-cell">{m.superstrings()}</th>
					<th class="px-4 py-1">
						<button
							class="text-left"
							onclick={() => (sortBy = sortBy === 'wins-asc' ? 'wins-desc' : 'wins-asc')}
							>{m.wins()}
							{#if sortBy === 'wins-asc'}
								<TypcnArrowSortedUp class="inline-block" />
							{:else if sortBy === 'wins-desc'}
								<TypcnArrowSortedDown class="inline-block" />
							{:else}
								<TypcnArrowUnsorted class="inline-block" />
							{/if}
						</button>
					</th>
					<th class="px-4 py-1">
						<button
							class="text-left"
							onclick={() => (sortBy = sortBy === 'rating-asc' ? 'rating-desc' : 'rating-asc')}
							>{m.rating()}
							{#if sortBy === 'rating-asc'}
								<TypcnArrowSortedUp class="inline-block" />
							{:else if sortBy === 'rating-desc'}
								<TypcnArrowSortedDown class="inline-block" />
							{:else}
								<TypcnArrowUnsorted class="inline-block" />
							{/if}
						</button>
					</th>
				</tr>
			</thead>
			<tbody>
				{#each filtered as player}
					<tr class="border-b-1 border-gray-500 bg-gray-800 px-4 py-2 shadow-2xl">
						<td class="px-4 py-1">
							<a class="flex items-baseline gap-1" href={`/players/${player.slug ?? player.id}`}
								>{player.name}
								{#each getAllNames(player).filter((name) => name !== player.name) as name}
									<span class="text-xs text-gray-400">({name})</span>
								{/each}
							</a>
						</td>
						<td class="px-4 py-1 text-sm">
							{#each data.playersTeams[player.id ?? ''] as team, i}
								<a href={`/teams/${team.name}`}>{team.name}</a
								>{#if i < data.playersTeams[player.id ?? ''].length - 1}
									<span class="mx-1 text-gray-400">|</span>
								{/if}
							{/each}
						</td>
						<td class="hidden flex-wrap gap-1 sm:flex">
							{#each data.playersAgents[player.id ?? ''] as superstring}
								<CharacterIcon character={superstring[0]} />
							{/each}
						</td>
						<td class="px-4 py-1 text-gray-300">{player.wins}</td>
						<td class="px-4 py-1 text-gray-300" title={m.rating() + ' ' + player.rating}>
							{player.rating.toFixed(2)}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
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
