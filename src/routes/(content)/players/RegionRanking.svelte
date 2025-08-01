<script lang="ts">
	import NationalityFlag from '$lib/components/NationalityFlag.svelte';
	import { m } from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';
	import { countryCodeToLocalizedName } from '$lib/utils/strings';
	import type { TCountryCode } from 'countries-list';
	import TypcnArrowUnsorted from '~icons/typcn/arrow-unsorted';
	import TypcnArrowSortedDown from '~icons/typcn/arrow-sorted-down';
	import TypcnArrowSortedUp from '~icons/typcn/arrow-sorted-up';

	let {
		players,
		uniqueNationalities,
		regionSortBy: sortBy = $bindable('players-desc')
	}: {
		players: {
			wins: number;
			rating: number;
			kd: number;
			eventsCount: number;
			id: string;
			name: string;
			slug: string;
			nationalities: TCountryCode[];
			aliases?: string[];
		}[];
		uniqueNationalities: TCountryCode[];
		regionSortBy:
			| 'region-asc'
			| 'region-desc'
			| 'players-asc'
			| 'players-desc'
			| 'wins-asc'
			| 'wins-desc'
			| 'rating-asc'
			| 'rating-desc';
	} = $props();

	// Calculate country statistics
	let countryStats = $derived(
		uniqueNationalities
			.map((nationality) => {
				const playersInCountry = players.filter((p) => p.nationalities.includes(nationality));
				const totalPlayers = playersInCountry.length;
				const totalWins = playersInCountry.reduce((sum, p) => sum + p.wins, 0);

				// Filter out players with rating of 0 for average calculation
				const playersWithValidRating = playersInCountry.filter((p) => p.rating > 0);
				const avgRating =
					playersWithValidRating.length > 0
						? playersWithValidRating.reduce((sum, p) => sum + p.rating, 0) /
							playersWithValidRating.length
						: 0;

				return {
					nationality,
					totalPlayers,
					totalWins,
					avgRating
				};
			})
			.sort((a, b) => {
				if (sortBy === 'region-asc') {
					return (
						countryCodeToLocalizedName(a.nationality ?? '', getLocale())?.localeCompare(
							countryCodeToLocalizedName(b.nationality ?? '', getLocale()) ?? ''
						) ?? 0
					);
				} else if (sortBy === 'region-desc') {
					return (
						countryCodeToLocalizedName(b.nationality ?? '', getLocale())?.localeCompare(
							countryCodeToLocalizedName(a.nationality ?? '', getLocale()) ?? ''
						) ?? 0
					);
				} else if (sortBy === 'players-asc') {
					return a.totalPlayers - b.totalPlayers;
				} else if (sortBy === 'players-desc') {
					return b.totalPlayers - a.totalPlayers;
				} else if (sortBy === 'wins-asc') {
					return a.totalWins - b.totalWins;
				} else if (sortBy === 'wins-desc') {
					return b.totalWins - a.totalWins;
				} else if (sortBy === 'rating-asc') {
					return a.avgRating - b.avgRating;
				} else if (sortBy === 'rating-desc') {
					return b.avgRating - a.avgRating;
				}
				return 0;
			})
	);
</script>

<div
	class="glass-card-container overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb:hover]:bg-slate-500 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-800"
>
	<table class="glass-table w-full table-auto">
		<thead>
			<tr>
				<th class="px-4 py-2">
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
						{/if}
					</button>
				</th>
				<th class="px-4 py-2">
					<button
						class="flex items-center gap-1 text-left"
						class:text-white={sortBy === 'players-asc' || sortBy === 'players-desc'}
						onclick={() => (sortBy = sortBy === 'players-asc' ? 'players-desc' : 'players-asc')}
					>
						{m.players()}
						{#if sortBy === 'players-asc'}
							<TypcnArrowSortedUp class="inline-block" />
						{:else if sortBy === 'players-desc'}
							<TypcnArrowSortedDown class="inline-block" />
						{:else}
							<TypcnArrowUnsorted class="inline-block" />
						{/if}
					</button>
				</th>
				<th class="px-4 py-2">
					<button
						class="flex items-center gap-1 text-left"
						class:text-white={sortBy === 'wins-asc' || sortBy === 'wins-desc'}
						onclick={() => (sortBy = sortBy === 'wins-asc' ? 'wins-desc' : 'wins-asc')}
					>
						{m.wins()}
						{#if sortBy === 'wins-asc'}
							<TypcnArrowSortedUp class="inline-block" />
						{:else if sortBy === 'wins-desc'}
							<TypcnArrowSortedDown class="inline-block" />
						{:else}
							<TypcnArrowUnsorted class="inline-block" />
						{/if}
					</button>
				</th>
				<th class="px-4 py-2">
					<button
						class="flex items-center gap-1 text-left"
						class:text-white={sortBy === 'rating-asc' || sortBy === 'rating-desc'}
						onclick={() => (sortBy = sortBy === 'rating-asc' ? 'rating-desc' : 'rating-asc')}
					>
						{m.rating()}
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
			{#each countryStats as stat (stat.nationality)}
				<tr>
					<td class="px-4 py-2">
						<div class="flex items-center gap-2">
							<NationalityFlag nationality={stat.nationality ?? ''} />
							<span>{countryCodeToLocalizedName(stat.nationality ?? '', getLocale())}</span>
						</div>
					</td>
					<td class="px-4 py-2 text-gray-300">{stat.totalPlayers}</td>
					<td class="px-4 py-2 text-gray-300">{stat.totalWins}</td>
					<td class="px-4 py-2 text-gray-300">{stat.avgRating.toFixed(2)}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
