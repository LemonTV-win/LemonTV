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
	import IconChevronDown from '~icons/mdi/chevron-down';
	let { data }: PageProps = $props();

	let search = $state(data.search || '');
	let selectedNationalities = $state<string[]>([]);
	let selectedSuperstrings = $state<string[]>([]);
	let filtersExpanded = $state(false);

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
		| 'kd-desc' = $state('name-abc');

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
			} else if (sortBy === 'kd-asc') {
				return a.kd - b.kd;
			} else if (sortBy === 'kd-desc') {
				return b.kd - a.kd;
			}
			return 0;
		})
	);

	let filtered = $derived(
		sorted.filter((player) => {
			const matchesSearch = player.name.toLowerCase().includes(search.toLowerCase());
			const matchesNationality =
				selectedNationalities.length === 0 ||
				(player.nationality && selectedNationalities.includes(player.nationality));
			const matchesSuperstring =
				selectedSuperstrings.length === 0 ||
				data.playersAgents[player.id ?? '']?.some(([agent]) =>
					selectedSuperstrings.includes(agent)
				);

			return matchesSearch && matchesNationality && matchesSuperstring;
		})
	);

	$effect(() => {
		const params = new URLSearchParams();
		if (sortBy) params.set('sortBy', sortBy);
		if (search) params.set('search', search);
		if (selectedNationalities.length) params.set('nationalities', selectedNationalities.join(','));
		if (selectedSuperstrings.length) params.set('superstrings', selectedSuperstrings.join(','));
		goto(`/players?${params.toString()}`);
	});

	onMount(() => {
		const url = new URL(window.location.href);
		const urlSortBy = url.searchParams.get('sortBy');
		const urlSearch = url.searchParams.get('search');
		const urlNationalities = url.searchParams.get('nationalities');
		const urlSuperstrings = url.searchParams.get('superstrings');

		if (urlSearch) search = urlSearch;
		if (urlNationalities) selectedNationalities = urlNationalities.split(',');
		if (urlSuperstrings) selectedSuperstrings = urlSuperstrings.split(',');

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
				urlSortBy === 'team-desc' ||
				urlSortBy === 'kd-asc' ||
				urlSortBy === 'kd-desc')
		) {
			sortBy = urlSortBy;
		}
	});

	// Get unique nationalities and superstrings for filter options
	let uniqueNationalities = $derived([
		...new Set(data.players.map((p) => p.nationality).filter(Boolean))
	]);
	let uniqueSuperstrings = $derived([
		...new Set(
			Object.values(data.playersAgents)
				.flat()
				.map(([agent]) => agent)
		)
	]);
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

	<div class="mb-4 flex flex-col">
		<button
			class="flex items-center justify-between rounded-t-lg border border-white/30 bg-gradient-to-br from-slate-600/60 to-slate-800 px-4 py-2 text-left text-sm font-medium text-gray-300 backdrop-blur-lg transition-colors hover:bg-white/10"
			onclick={() => (filtersExpanded = !filtersExpanded)}
		>
			<span>{m.filters()}</span>
			<IconChevronDown
				class="h-4 w-4 transition-transform duration-200 {filtersExpanded ? 'rotate-180' : ''}"
			/>
		</button>
		<div
			class="grid transition-all duration-200"
			class:grid-rows-[1fr]={filtersExpanded}
			class:grid-rows-[0fr]={!filtersExpanded}
		>
			<div class="overflow-hidden">
				<div
					class="flex flex-col gap-4 rounded-b-lg border border-t-0 border-white/30 bg-gradient-to-br from-slate-600/60 to-slate-800 p-4 shadow-2xl ring-1 ring-white/30 backdrop-blur-lg"
				>
					<div class="flex flex-col gap-2">
						<label for="nationality-filters" class="text-sm font-medium text-gray-300"
							>{m.region()}</label
						>
						<div id="nationality-filters" class="flex flex-wrap gap-2">
							{#each uniqueNationalities as nationality}
								{#if nationality}
									<button
										class={[
											'flex items-center gap-1 rounded-full border-1 px-2 py-1 text-sm transition-colors',
											selectedNationalities.includes(nationality)
												? 'border-blue-500 bg-blue-500 text-white'
												: 'border-white/30 bg-transparent text-gray-400'
										]}
										onclick={() => {
											selectedNationalities = selectedNationalities.includes(nationality)
												? selectedNationalities.filter((n) => n !== nationality)
												: [...selectedNationalities, nationality];
										}}
									>
										<NationalityFlag {nationality} />
										<span
											class:text-white={selectedNationalities.includes(nationality)}
											class:text-gray-400={!selectedNationalities.includes(nationality)}
										>
											{countryCodeToLocalizedName(nationality, getLocale())}
										</span>
									</button>
								{/if}
							{/each}
						</div>
					</div>

					<div class="flex flex-col gap-2">
						<label for="superstring-filters" class="text-sm font-medium text-gray-300"
							>{m.superstrings()}</label
						>
						<div id="superstring-filters" class="flex flex-wrap gap-2">
							{#each uniqueSuperstrings as superstring}
								<button
									class={[
										'flex items-center gap-1 rounded-full border-1 px-2 py-1 text-sm transition-colors',
										selectedSuperstrings.includes(superstring)
											? 'border-blue-500 bg-blue-500 text-white'
											: 'border-white/30 bg-transparent text-gray-400'
									]}
									onclick={() => {
										selectedSuperstrings = selectedSuperstrings.includes(superstring)
											? selectedSuperstrings.filter((s) => s !== superstring)
											: [...selectedSuperstrings, superstring];
									}}
								>
									<CharacterIcon character={superstring} />
									<span
										class:text-white={selectedSuperstrings.includes(superstring)}
										class:text-gray-400={!selectedSuperstrings.includes(superstring)}
									>
										{superstring}
									</span>
								</button>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div
		class="glass-card-container overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb:hover]:bg-slate-500 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-800"
	>
		<table class="glass-table w-full table-auto">
			<thead>
				<tr>
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
					<th class="px-4 py-1">
						<button
							class="flex items-center gap-1 text-left"
							class:text-white={sortBy === 'kd-asc' || sortBy === 'kd-desc'}
							onclick={() => (sortBy = sortBy === 'kd-asc' ? 'kd-desc' : 'kd-asc')}
							>K/D
							{#if sortBy === 'kd-asc'}
								<TypcnArrowSortedUp class="inline-block" />
							{:else if sortBy === 'kd-desc'}
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
					<tr>
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
						<td class="px-4 py-1 text-gray-300" title="Kill/Death Ratio">
							{player.kd.toFixed(2)}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</main>
