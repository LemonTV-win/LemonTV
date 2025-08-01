<script lang="ts">
	import CharacterIcon from '$lib/components/CharacterIcon.svelte';
	import type { PlayerScore } from '$lib/data/matches';
	import type { Team } from '$lib/data/teams';

	import SVP from '$assets/svp.png';
	import MVP from '$assets/mvp.png';
	import { m } from '$lib/paraglide/messages';
	import TypcnArrowUnsorted from '~icons/typcn/arrow-unsorted';
	import TypcnArrowSortedDown from '~icons/typcn/arrow-sorted-down';
	import TypcnArrowSortedUp from '~icons/typcn/arrow-sorted-up';

	let {
		scores,
		winner,
		teams,
		sortBy = $bindable('score-desc')
	}: {
		scores: [PlayerScore[], PlayerScore[]];
		winner: number;
		teams: [Team, Team];
		sortBy:
			| 'score-asc'
			| 'score-desc'
			| 'damageScore-asc'
			| 'damageScore-desc'
			| 'kills-asc'
			| 'kills-desc'
			| 'deaths-asc'
			| 'deaths-desc'
			| 'assists-asc'
			| 'assists-desc'
			| 'damage-asc'
			| 'damage-desc'
			| 'player-asc'
			| 'player-desc';
	} = $props();

	let mvps: [string, string] = $derived([getMVP(scores[0]), getMVP(scores[1])]);

	function getMVP(scores: PlayerScore[]): string {
		return scores.reduce((acc, score) => {
			return score.score > acc.score ? score : acc;
		}, scores[0]).player;
	}

	// Helper function to get player URL
	function getPlayerUrl(score: PlayerScore): string {
		return score.playerSlug ? `/players/${score.playerSlug}` : `/players/${score.player}`;
	}

	// Sorting function
	function sortScores(scores: PlayerScore[]): PlayerScore[] {
		const sortedScores = [...scores];

		switch (sortBy) {
			case 'score-asc':
				return sortedScores.sort((a, b) => a.score - b.score);
			case 'score-desc':
				return sortedScores.sort((a, b) => b.score - a.score);
			case 'damageScore-asc':
				return sortedScores.sort((a, b) => a.damageScore - b.damageScore);
			case 'damageScore-desc':
				return sortedScores.sort((a, b) => b.damageScore - a.damageScore);
			case 'kills-asc':
				return sortedScores.sort((a, b) => a.kills - b.kills);
			case 'kills-desc':
				return sortedScores.sort((a, b) => b.kills - a.kills);
			case 'deaths-asc':
				return sortedScores.sort((a, b) => a.deaths - b.deaths);
			case 'deaths-desc':
				return sortedScores.sort((a, b) => b.deaths - a.deaths);
			case 'assists-asc':
				return sortedScores.sort((a, b) => a.assists - b.assists);
			case 'assists-desc':
				return sortedScores.sort((a, b) => b.assists - a.assists);
			case 'damage-asc':
				return sortedScores.sort((a, b) => a.damage - b.damage);
			case 'damage-desc':
				return sortedScores.sort((a, b) => b.damage - a.damage);
			case 'player-asc':
				return sortedScores.sort((a, b) => a.player.localeCompare(b.player));
			case 'player-desc':
				return sortedScores.sort((a, b) => b.player.localeCompare(a.player));
			default:
				return sortedScores.sort((a, b) => b.score - a.score);
		}
	}

	// Get sorted scores for each team
	let sortedScores: [PlayerScore[], PlayerScore[]] = $derived([
		sortScores(scores[0]),
		sortScores(scores[1])
	]);
</script>

{#snippet playerscores(scores: PlayerScore[], winner: boolean)}
	{#each scores as score (score.player)}
		<tr
			class="border-b border-white/10 bg-white/10 backdrop-blur-sm transition-all duration-200 hover:bg-white/20"
		>
			<td class="w-auto px-4 text-center font-bold">
				{#if mvps[0] === score.player || mvps[1] === score.player}
					{#if winner}
						<span class="text-yellow-300 drop-shadow-[0_0_8px_rgba(255,255,0,0.3)]" title="MVP">
							<img src={MVP} alt="MVP" class="h-5" />
						</span>
					{:else}
						<span class="text-neutral-300 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" title="SVP">
							<img src={SVP} alt="SVP" class="h-5" />
						</span>
					{/if}
				{/if}
			</td>
			<td class="py-2 text-center">
				<div class="flex items-center justify-center gap-1">
					{#each score.characters as character, index (index)}
						<CharacterIcon {character} />
					{/each}
				</div>
			</td>
			<td class="py-2 text-center font-bold">
				<a
					href={getPlayerUrl(score)}
					class="text-center font-medium transition-colors duration-200 hover:text-yellow-300 hover:underline"
					>{score.player}</a
				>
			</td>
			<td class="py-2 text-center font-semibold">{score.score}</td>
			<td class="py-2 text-center font-semibold">{score.damageScore}</td>
			<td class="py-2 text-center font-semibold"
				>{score.kills} ({score.knocks}) / {score.deaths} / {score.assists}</td
			>
			<td class="py-2 text-center font-semibold">{score.damage}</td>
		</tr>
	{/each}
{/snippet}

{#snippet teamName(team: Team)}
	<tr>
		<td colspan="2"></td>
		<td class="text-center">
			<a
				href={`/teams/${team.id}`}
				class="flex items-center justify-center gap-3 px-5 py-2 font-bold transition-all duration-200 hover:from-slate-700/80 hover:to-slate-600/80 hover:text-yellow-300 hover:underline"
			>
				{team.name}
			</a>
		</td>
		<td colspan="4"></td>
	</tr>
{/snippet}

<div class="overflow-hidden rounded-md bg-white/10">
	<table class="w-full">
		<thead>
			<tr
				class="border-b-2 border-white/20 bg-gradient-to-b from-white/20 to-white/30 text-center backdrop-blur-md"
			>
				<th class="px-2 py-4 text-sm font-semibold text-gray-100"></th>
				<th class="px-2 py-4 text-sm font-semibold text-gray-100">{m.superstrings()}</th>
				<th class="px-2 py-4 text-sm font-semibold text-gray-100">
					<button
						class="mx-auto flex items-center justify-center gap-1"
						class:text-white={sortBy === 'player-asc' || sortBy === 'player-desc'}
						onclick={() => (sortBy = sortBy === 'player-asc' ? 'player-desc' : 'player-asc')}
					>
						{m.player()}
						{#if sortBy === 'player-asc'}
							<TypcnArrowSortedUp class="inline-block" />
						{:else if sortBy === 'player-desc'}
							<TypcnArrowSortedDown class="inline-block" />
						{:else}
							<TypcnArrowUnsorted class="inline-block" />
						{/if}
					</button>
				</th>
				<th class="px-2 py-4 text-sm font-semibold text-gray-100">
					<button
						class="mx-auto flex items-center justify-center gap-1"
						class:text-white={sortBy === 'score-asc' || sortBy === 'score-desc'}
						onclick={() => (sortBy = sortBy === 'score-asc' ? 'score-desc' : 'score-asc')}
					>
						{m.performance_score()}
						{#if sortBy === 'score-asc'}
							<TypcnArrowSortedUp class="inline-block" />
						{:else if sortBy === 'score-desc'}
							<TypcnArrowSortedDown class="inline-block" />
						{:else}
							<TypcnArrowUnsorted class="inline-block" />
						{/if}
					</button>
				</th>
				<th class="px-2 py-4 text-sm font-semibold text-gray-100">
					<button
						class="mx-auto flex items-center justify-center gap-1"
						class:text-white={sortBy === 'damageScore-asc' || sortBy === 'damageScore-desc'}
						onclick={() =>
							(sortBy = sortBy === 'damageScore-asc' ? 'damageScore-desc' : 'damageScore-asc')}
					>
						{m.damage_score()}
						{#if sortBy === 'damageScore-asc'}
							<TypcnArrowSortedUp class="inline-block" />
						{:else if sortBy === 'damageScore-desc'}
							<TypcnArrowSortedDown class="inline-block" />
						{:else}
							<TypcnArrowUnsorted class="inline-block" />
						{/if}
					</button>
				</th>
				<th class="px-2 py-4 text-sm font-semibold text-gray-100">
					<button
						class="mx-auto flex items-center justify-center gap-1"
						class:text-white={sortBy === 'kills-asc' ||
							sortBy === 'kills-desc' ||
							sortBy === 'deaths-asc' ||
							sortBy === 'deaths-desc' ||
							sortBy === 'assists-asc' ||
							sortBy === 'assists-desc'}
						onclick={() => {
							if (sortBy === 'kills-asc') sortBy = 'kills-desc';
							else if (sortBy === 'kills-desc') sortBy = 'deaths-asc';
							else if (sortBy === 'deaths-asc') sortBy = 'deaths-desc';
							else if (sortBy === 'deaths-desc') sortBy = 'assists-asc';
							else if (sortBy === 'assists-asc') sortBy = 'assists-desc';
							else sortBy = 'kills-asc';
						}}
					>
						{m.kills()} ({m.knocks()}) / {m.deaths()} / {m.assists()}
						{#if sortBy === 'kills-asc'}
							<TypcnArrowSortedUp class="inline-block" />
						{:else if sortBy === 'kills-desc'}
							<TypcnArrowSortedDown class="inline-block" />
						{:else if sortBy === 'deaths-asc'}
							<TypcnArrowSortedUp class="inline-block" />
						{:else if sortBy === 'deaths-desc'}
							<TypcnArrowSortedDown class="inline-block" />
						{:else if sortBy === 'assists-asc'}
							<TypcnArrowSortedUp class="inline-block" />
						{:else if sortBy === 'assists-desc'}
							<TypcnArrowSortedDown class="inline-block" />
						{:else}
							<TypcnArrowUnsorted class="inline-block" />
						{/if}
					</button>
				</th>
				<th class="px-2 py-4 text-sm font-semibold text-gray-300">
					<button
						class="mx-auto flex items-center justify-center gap-1"
						class:text-white={sortBy === 'damage-asc' || sortBy === 'damage-desc'}
						onclick={() => (sortBy = sortBy === 'damage-asc' ? 'damage-desc' : 'damage-asc')}
					>
						{m.damage()}
						{#if sortBy === 'damage-asc'}
							<TypcnArrowSortedUp class="inline-block" />
						{:else if sortBy === 'damage-desc'}
							<TypcnArrowSortedDown class="inline-block" />
						{:else}
							<TypcnArrowUnsorted class="inline-block" />
						{/if}
					</button>
				</th>
			</tr>
		</thead>
		<tbody>
			{@render teamName(teams[0])}

			{@render playerscores(sortedScores[0], winner === 0)}

			{@render teamName(teams[1])}

			{@render playerscores(sortedScores[1], winner === 1)}
		</tbody>
	</table>
</div>
