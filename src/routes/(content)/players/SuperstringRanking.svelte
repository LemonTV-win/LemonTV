<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';
	import { countryCodeToLocalizedName } from '$lib/utils/strings';
	import type { TCountryCode } from 'countries-list';
	import {
		CHARACTER_NAMES,
		PUS_CHARACTERS,
		SCISORS_CHARACTERS,
		URBINO_CHARACTERS,
		type Character
	} from '$lib/data/game';
	import TypcnArrowUnsorted from '~icons/typcn/arrow-unsorted';
	import TypcnArrowSortedDown from '~icons/typcn/arrow-sorted-down';
	import TypcnArrowSortedUp from '~icons/typcn/arrow-sorted-up';
	import CharacterIcon from '$lib/components/CharacterIcon.svelte';
	import NationalityFlag from '$lib/components/NationalityFlag.svelte';
	import { getAllNames } from '$lib/data/players';

	let {
		players,
		superstringPowerData,
		selectedCharacter = $bindable('Yvette' as Character),
		sortBy = $bindable('power-desc')
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
			teams: { id: string; name: string; slug: string }[];
		}[];
		superstringPowerData: Record<
			string,
			{ playerId: string; power: number; gamesPlayed: number; wins: number }[]
		>;
		selectedCharacter: Character;
		sortBy:
			| 'power-asc'
			| 'power-desc'
			| 'games-asc'
			| 'games-desc'
			| 'wins-asc'
			| 'wins-desc'
			| 'name-asc'
			| 'name-desc';
	} = $props();

	// Get available characters from the data
	let availableCharacters = $derived(
		Object.keys(superstringPowerData).filter(
			(char) => superstringPowerData[char as Character].length > 0
		) as Character[]
	);

	// Get players with Superstring Power for the selected character
	let rankedPlayers = $derived.by(() => {
		const characterData = superstringPowerData[selectedCharacter] || [];
		const playerMap = new Map(players.map((p) => [p.id, p]));
		const playerData = characterData
			.map(({ playerId, power, gamesPlayed, wins }) => {
				const player = playerMap.get(playerId);
				if (!player) return null;

				return {
					...player,
					superstringPower: power,
					gamesPlayed,
					wins
				};
			})
			.filter(Boolean) as {
			id: string;
			name: string;
			slug: string;
			nationalities: TCountryCode[];
			aliases?: string[];
			superstringPower: number;
			gamesPlayed: number;
			wins: number;
			teams: { id: string; name: string; slug: string }[];
		}[];
		return playerData.sort((a, b) => {
			if (sortBy === 'power-asc') {
				return a.superstringPower - b.superstringPower;
			} else if (sortBy === 'power-desc') {
				return b.superstringPower - a.superstringPower;
			} else if (sortBy === 'games-asc') {
				return a.gamesPlayed - b.gamesPlayed;
			} else if (sortBy === 'games-desc') {
				return b.gamesPlayed - a.gamesPlayed;
			} else if (sortBy === 'wins-asc') {
				return a.wins - b.wins;
			} else if (sortBy === 'wins-desc') {
				return b.wins - a.wins;
			} else if (sortBy === 'name-asc') {
				return a.name.localeCompare(b.name);
			} else if (sortBy === 'name-desc') {
				return b.name.localeCompare(a.name);
			}
			return 0;
		});
	});
</script>

<div class="mb-6">
	<!-- Character Selector -->
	<div class="mb-4">
		<label for="character-select" class="mb-2 block text-sm font-medium text-gray-300">
			{m.superstrings()}
		</label>
		{#snippet characterButton(character: Character, faction: 'PUS' | 'Scissors' | 'Urbino')}
			<button
				class={[
					'flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors',
					selectedCharacter === character
						? {
								PUS: 'border-blue-500 bg-blue-500 text-blue-500',
								Scissors: 'border-red-500 bg-red-500 text-red-500',
								Urbino: 'border-yellow-500 bg-yellow-500 text-yellow-500'
							}[faction]
						: 'border-white/30  text-gray-400  hover:bg-white/10',
					'backdrop-blur-md',
					faction === 'PUS' && 'bg-blue-500/10',
					faction === 'Scissors' && 'bg-red-500/10',
					faction === 'Urbino' && 'bg-yellow-500/10'
				]}
				onclick={() => (selectedCharacter = character)}
			>
				<CharacterIcon {character} />
				<span>{CHARACTER_NAMES[character]()}</span>
			</button>
		{/snippet}
		<div class="flex flex-wrap gap-2">
			{#each PUS_CHARACTERS.filter( (char) => availableCharacters.includes(char) ) as character (character)}
				{@render characterButton(character, 'PUS')}
			{/each}
			{#each SCISORS_CHARACTERS.filter( (char) => availableCharacters.includes(char) ) as character (character)}
				{@render characterButton(character, 'Scissors')}
			{/each}
			{#each URBINO_CHARACTERS.filter( (char) => availableCharacters.includes(char) ) as character (character)}
				{@render characterButton(character, 'Urbino')}
			{/each}
		</div>
	</div>

	<!-- Ranking Table -->
	<div class="glass-card-container styled-scroll-horizontal overflow-x-auto">
		<table class="glass-table w-full table-auto">
			<thead>
				<tr>
					<th class="px-4 py-2 text-right text-sm whitespace-nowrap text-gray-400">
						{m.rank()}
					</th>
					<th class="px-4 py-2 whitespace-nowrap">
						{m.region()}
					</th>
					<th class="px-4 py-2 whitespace-nowrap">
						<button
							class="flex items-center gap-1 text-left"
							class:text-white={sortBy === 'name-asc' || sortBy === 'name-desc'}
							onclick={() => (sortBy = sortBy === 'name-asc' ? 'name-desc' : 'name-asc')}
						>
							{m.name()}
							{#if sortBy === 'name-asc'}
								<TypcnArrowSortedUp class="inline-block" />
							{:else if sortBy === 'name-desc'}
								<TypcnArrowSortedDown class="inline-block" />
							{:else}
								<TypcnArrowUnsorted class="inline-block" />
							{/if}
						</button>
					</th>
					<th class="px-4 py-2 whitespace-nowrap">
						<button
							class="flex items-center gap-1 text-left"
							class:text-white={sortBy === 'power-asc' || sortBy === 'power-desc'}
							onclick={() => (sortBy = sortBy === 'power-asc' ? 'power-desc' : 'power-asc')}
						>
							{m.superstring_power()}
							{#if sortBy === 'power-asc'}
								<TypcnArrowSortedUp class="inline-block" />
							{:else if sortBy === 'power-desc'}
								<TypcnArrowSortedDown class="inline-block" />
							{:else}
								<TypcnArrowUnsorted class="inline-block" />
							{/if}
						</button>
					</th>
					<th class="px-4 py-2 whitespace-nowrap">
						<button
							class="flex items-center gap-1 text-left"
							class:text-white={sortBy === 'games-asc' || sortBy === 'games-desc'}
							onclick={() => (sortBy = sortBy === 'games-asc' ? 'games-desc' : 'games-asc')}
						>
							{m.games_played()}
							{#if sortBy === 'games-asc'}
								<TypcnArrowSortedUp class="inline-block" />
							{:else if sortBy === 'games-desc'}
								<TypcnArrowSortedDown class="inline-block" />
							{:else}
								<TypcnArrowUnsorted class="inline-block" />
							{/if}
						</button>
					</th>
					<th class="px-4 py-2 whitespace-nowrap">
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
					<th class="px-4 py-2 whitespace-nowrap">{m.teams()}</th>
				</tr>
			</thead>
			<tbody>
				{#each rankedPlayers as player, index (player.id)}
					<tr>
						<td class="px-4 py-2 text-right text-sm text-gray-400">#{index + 1}</td>
						<td class="px-4 py-2">
							<div class="flex items-center gap-2">
								{#each player.nationalities as nationality, idx (idx)}
									<NationalityFlag {nationality} />
								{/each}
							</div>
						</td>
						<td class="w-full px-4 py-2">
							<a
								class="flex flex-col items-baseline gap-1"
								href={`/players/${player.slug ?? player.id}`}
							>
								<span>{player.name}</span>
								{#each getAllNames(player).filter((name) => name !== player.name) as name (name)}
									<span class="text-xs text-gray-400">({name})</span>
								{/each}
							</a>
						</td>
						<td class="px-4 py-2 font-mono text-gray-300">
							{player.superstringPower.toFixed(2)}
						</td>
						<td class="px-4 py-2 text-gray-300">
							{player.gamesPlayed}
						</td>
						<td class="px-4 py-2 text-gray-300">
							{player.wins}
						</td>

						<td class="px-4 py-2 text-sm whitespace-nowrap">
							{#each player.teams as team, i (team.id)}
								<a href={`/teams/${team.slug}`}>{team.name}</a>
								{#if i < player.teams.length - 1}
									<span class="mx-1 text-gray-400">|</span>
								{/if}
							{/each}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
