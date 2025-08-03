<script lang="ts">
	import type { Team } from '$lib/data/teams';
	import type { Character } from '$lib/data/game';
	import { m } from '$lib/paraglide/messages.js';
	import TypcnArrowUnsorted from '~icons/typcn/arrow-unsorted';
	import TypcnArrowSortedDown from '~icons/typcn/arrow-sorted-down';
	import TypcnArrowSortedUp from '~icons/typcn/arrow-sorted-up';
	import { getAllNames } from '$lib/data/players';
	import NationalityFlag from '$lib/components/NationalityFlag.svelte';
	import type { TCountryCode } from 'countries-list';
	import PlayerFrequentAgents from './PlayerFrequentAgents.svelte';

	let {
		playersTeams,
		playersAgents,
		sortBy,
		players
	}: {
		playersTeams: Record<string, Team[]>;
		playersAgents: Record<string, [Character, number][]>;
		sortBy: string;
		players: {
			id: string;
			slug: string;
			name: string;
			nationalities: TCountryCode[];
			avatarURL?: string | null;
			wins: number;
			rating: number;
			kd: number;
			eventsCount: number;
			gameAccounts: {
				currentName: string;
				names?: string[];
			}[];
			aliases?: string[];
		}[];
	} = $props();
</script>

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
				<th class="px-4 py-1">
					<button
						class="flex items-center gap-1 text-left"
						class:text-white={sortBy === 'events-asc' || sortBy === 'events-desc'}
						onclick={() => (sortBy = sortBy === 'events-asc' ? 'events-desc' : 'events-asc')}
					>
						{m.events()}
						{#if sortBy === 'events-asc'}
							<TypcnArrowSortedUp class="inline-block" />
						{:else if sortBy === 'events-desc'}
							<TypcnArrowSortedDown class="inline-block" />
						{:else}
							<TypcnArrowUnsorted class="inline-block" />
						{/if}
					</button>
				</th>
			</tr>
		</thead>
		<tbody>
			{#each players as player, playerIndex (player.id)}
				<tr>
					<td class=" py-1 text-center">
						{#each player.nationalities as nationality, idx (idx)}
							<NationalityFlag {nationality} />
						{/each}
					</td>
					<td class="px-4 py-1">
						<a
							class="flex items-center gap-3 transition-all duration-200 hover:text-yellow-400"
							href={`/players/${player.slug ?? player.id}`}
						>
							{#if player.avatarURL}
								<img
									src={player.avatarURL}
									alt={player.name}
									class="h-8 w-8 rounded-full object-cover"
								/>
							{/if}
							<div class="flex flex-col items-baseline gap-1">
								{player.name}
								{#each getAllNames(player).filter((name) => name !== player.name) as name (name)}
									<span class="text-xs text-gray-400">({name})</span>
								{/each}
							</div>
						</a>
					</td>
					<td class="px-4 py-1 text-sm">
						{#each playersTeams[player.id ?? ''] as team, i (team.id)}
							<a
								href={`/teams/${team.slug}`}
								class="transition-all duration-200 hover:text-yellow-400">{team.name}</a
							>{#if i < playersTeams[player.id ?? ''].length - 1}
								<span class="mx-1 text-gray-400">|</span>
							{/if}
						{/each}
					</td>
					<td class="hidden flex-wrap gap-1 text-center align-middle sm:table-cell">
						<PlayerFrequentAgents playerAgents={playersAgents[player.id ?? '']} {playerIndex} />
					</td>
					<td class="px-4 py-1 text-center text-gray-300">{player.wins}</td>
					<td class="px-4 py-1 text-center text-gray-300" title={m.rating() + ' ' + player.rating}>
						{player.rating.toFixed(2)}
					</td>
					<td class="px-4 py-1 text-center text-gray-300" title="Kill/Death Ratio">
						{player.kd.toFixed(2)}
					</td>
					<td class="px-4 py-1 text-center text-gray-300">{player.eventsCount}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
