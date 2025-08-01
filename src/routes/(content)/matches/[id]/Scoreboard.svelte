<script lang="ts">
	import CharacterIcon from '$lib/components/CharacterIcon.svelte';
	import type { PlayerScore } from '$lib/data/matches';
	import type { Team } from '$lib/data/teams';

	import SVP from '$assets/svp.png';
	import MVP from '$assets/mvp.png';
	import { m } from '$lib/paraglide/messages';

	let {
		scores,
		winner,
		teams
	}: { scores: [PlayerScore[], PlayerScore[]]; winner: number; teams: [Team, Team] } = $props();

	let mvps: [string, string] = $derived([getMVP(scores[0]), getMVP(scores[1])]);

	function getMVP(scores: PlayerScore[]): string {
		return scores.reduce((acc, score) => {
			return score.score > acc.score ? score : acc;
		}, scores[0]).player;
	}
</script>

{#snippet playerscores(scores: PlayerScore[], winner: boolean)}
	{#each scores as score (score.player)}
		<tr class="bg-white/10 backdrop-blur-md">
			<td class="w-auto px-4 text-center font-bold">
				{#if mvps[0] === score.player || mvps[1] === score.player}
					{#if winner}
						<span class="text-yellow-300" title="MVP">
							<img src={MVP} alt="MVP" class="h-4" />
						</span>
					{:else}
						<span class="text-neutral-300" title="SVP">
							<img src={SVP} alt="SVP" class="h-4" />
						</span>
					{/if}
				{/if}
			</td>
			<td class="text-center">
				<div class="flex items-center justify-center gap-2">
					{#each score.characters as character, index (index)}
						<CharacterIcon {character} />
					{/each}
				</div>
			</td>
			<td class="text-center">
				<a
					href={`/players/${score.player}`}
					class="tra nsition-colors text-center duration-200 hover:text-yellow-300 hover:underline"
					>{score.player}</a
				>
			</td>
			<td class="text-center">{score.score}</td>
			<td class="text-center">{score.damageScore}</td>
			<td class="text-center">{score.kills} ({score.knocks}) / {score.deaths} / {score.assists}</td>
			<td class="text-center">{score.damage}</td>
		</tr>
	{/each}
{/snippet}

<table class="w-auto">
	<thead>
		<tr class="rounded-full bg-gray-100/50 text-center">
			<th></th>
			<th class="py-3">{m.superstrings()}</th>
			<th class="py-3">{m.player()}</th>
			<th class="py-3">{m.performance_score()}</th>
			<th class="py-3">{m.damage_score()}</th>
			<th class="py-3">{m.kills()} ({m.knocks()}) / {m.deaths()} / {m.assists()}</th>
			<th class="py-3">{m.damage()}</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td colspan="6" class="h-6">
				<a
					href={`/teams/${teams[0].id}`}
					class="flex items-center justify-center gap-2 p-2 font-bold transition-colors duration-200 hover:text-yellow-300 hover:underline"
				>
					{teams[0].name}
				</a>
			</td>
		</tr>
		{@render playerscores(scores[0], winner === 0)}
		<tr>
			<td colspan="6" class="h-6">
				<a
					href={`/teams/${teams[1].id}`}
					class="flex items-center justify-center gap-2 p-2 font-bold transition-colors duration-200 hover:text-yellow-300 hover:underline"
				>
					{teams[1].name}
				</a>
			</td>
		</tr>
		{@render playerscores(scores[1], winner === 1)}
	</tbody>
</table>
