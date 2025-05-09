<script lang="ts">
	import type { PageProps } from './$types';

	import { m } from '$lib/paraglide/messages.js';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import CharacterIcon from '$lib/components/CharacterIcon.svelte';
	import TypcnArrowUnsorted from '~icons/typcn/arrow-unsorted';
	import TypcnArrowSortedDown from '~icons/typcn/arrow-sorted-down';
	import TypcnArrowSortedUp from '~icons/typcn/arrow-sorted-up';
	import IconParkSolidEdit from '~icons/icon-park-solid/edit';
	import SearchInput from '$lib/components/SearchInput.svelte';
	import { getAllNames } from '$lib/data/players';
	import countryCodeToFlagEmoji from 'country-code-to-flag-emoji';
	import { getLocale } from '$lib/paraglide/runtime';
	import { countryCodeToLocalizedName } from '$lib/utils/strings';
	import NationalityFlag from '$lib/components/NationalityFlag.svelte';
	let { data }: PageProps = $props();

	let search = $state('');
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
		| 'team-desc' = $state('name-abc');

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
				return a.nationality?.localeCompare(b.nationality ?? '') ?? 0;
			} else if (sortBy === 'region-desc') {
				return b.nationality?.localeCompare(a.nationality ?? '') ?? 0;
			} else if (sortBy === 'team-asc') {
				const aTeams = data.playersTeams[a.id ?? '']?.map((t) => t.name).join(', ') ?? '';
				const bTeams = data.playersTeams[b.id ?? '']?.map((t) => t.name).join(', ') ?? '';
				return aTeams.localeCompare(bTeams);
			} else if (sortBy === 'team-desc') {
				const aTeams = data.playersTeams[a.id ?? '']?.map((t) => t.name).join(', ') ?? '';
				const bTeams = data.playersTeams[b.id ?? '']?.map((t) => t.name).join(', ') ?? '';
				return bTeams.localeCompare(aTeams);
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
				urlSortBy === 'rating-desc' ||
				urlSortBy === 'region-asc' ||
				urlSortBy === 'region-desc' ||
				urlSortBy === 'team-asc' ||
				urlSortBy === 'team-desc')
		) {
			sortBy = urlSortBy;
		}
	});
</script>

<svelte:head>
	<title>{m.players()} | LemonTV</title>
</svelte:head>

<main class="mx-auto max-w-screen-lg px-4">
	<h1 class="my-10 flex items-center gap-4 text-2xl font-bold">
		{m.players()}
		{#if ['admin', 'editor'].some((role) => data.user?.roles.includes(role))}
			<a
				href="/admin/players"
				class="flex items-center gap-1 rounded-md border border-gray-700 px-2 py-1 text-sm text-gray-400 transition-all duration-200 hover:bg-gray-700"
			>
				<IconParkSolidEdit class="h-4 w-4" />
				{m.edit()}
			</a>
		{/if}
	</h1>

	<div class="mb-4 flex flex-col items-center justify-end gap-2 sm:flex-row">
		<SearchInput bind:search filtered={filtered.length} total={sorted.length} />
	</div>

	<div
		class="overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb:hover]:bg-slate-500 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-800"
	>
		<table class="w-full table-auto border-collapse border-y-2 border-gray-500 bg-gray-800">
			<thead>
				<tr class="border-b-2 border-gray-500 text-left text-sm text-gray-400">
					<th class="px-4 py-1">
						<button
							class="flex items-center gap-1 text-left"
							class:text-white={sortBy === 'region-asc' || sortBy === 'region-desc'}
							onclick={() => (sortBy = sortBy === 'region-asc' ? 'region-desc' : 'region-asc')}
						>
							{m.region()}
							{#if sortBy === 'region-asc'}
								<TypcnArrowSortedUp class="inline-block" />
							{:else if sortBy === 'region-desc'}
								<TypcnArrowSortedDown class="inline-block" />
							{:else}
								<TypcnArrowUnsorted class="inline-block" />
							{/if}</button
						></th
					>
					<th class="px-4 py-1">
						<button
							class="flex items-center gap-1 text-left"
							class:text-white={sortBy === 'name-abc' || sortBy === 'name-cba'}
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
					<th class="px-4 py-1">
						<button
							class="flex items-center gap-1 text-left"
							class:text-white={sortBy === 'team-asc' || sortBy === 'team-desc'}
							onclick={() => (sortBy = sortBy === 'team-asc' ? 'team-desc' : 'team-asc')}
							>{m.teams()}
							{#if sortBy === 'team-asc'}
								<TypcnArrowSortedUp class="inline-block" />
							{:else if sortBy === 'team-desc'}
								<TypcnArrowSortedDown class="inline-block" />
							{:else}
								<TypcnArrowUnsorted class="inline-block" />
							{/if}
						</button>
					</th>
					<th class="hidden px-4 py-1 sm:table-cell">{m.superstrings()}</th>
					<th class="px-4 py-1">
						<button
							class="flex items-center gap-1 text-left"
							class:text-white={sortBy === 'wins-asc' || sortBy === 'wins-desc'}
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
							class="flex items-center gap-1 text-left"
							class:text-white={sortBy === 'rating-asc' || sortBy === 'rating-desc'}
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
						<td class=" py-1 text-center">
							<NationalityFlag nationality={player.nationality} />
						</td>
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
								<a href={`/teams/${team.slug}`}>{team.name}</a
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
