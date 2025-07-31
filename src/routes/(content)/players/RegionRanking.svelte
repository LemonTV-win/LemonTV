<script lang="ts">
	import NationalityFlag from '$lib/components/NationalityFlag.svelte';
	import { m } from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';
	import { countryCodeToLocalizedName } from '$lib/utils/strings';
	import type { TCountryCode } from 'countries-list';

	let {
		players,
		uniqueNationalities
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
	} = $props();

	// Get unique nationalities and superstrings for filter options

	// Calculate country statistics
	let countryStats = $derived(
		uniqueNationalities
			.map((nationality) => {
				const playersInCountry = players.filter((p) => p.nationalities.includes(nationality));
				const totalPlayers = playersInCountry.length;
				const totalWins = playersInCountry.reduce((sum, p) => sum + p.wins, 0);
				const avgRating = playersInCountry.reduce((sum, p) => sum + p.rating, 0) / totalPlayers;

				return {
					nationality,
					totalPlayers,
					totalWins,
					avgRating
				};
			})
			.sort((a, b) => b.totalPlayers - a.totalPlayers)
	);
</script>

<div
	class="glass-card-container overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb:hover]:bg-slate-500 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-800"
>
	<table class="glass-table w-full table-auto">
		<thead>
			<tr>
				<th class="px-4 py-2 text-left">{m.region()}</th>
				<th class="px-4 py-2 text-left">{m.players()}</th>
				<th class="px-4 py-2 text-left">{m.wins()}</th>
				<th class="px-4 py-2 text-left">{m.rating()}</th>
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
