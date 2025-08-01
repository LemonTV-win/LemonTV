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
					href={`/players/${score.player}`}
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
				<th class="px-2 py-4 text-sm font-semibold text-gray-100">{m.player()}</th>
				<th class="px-2 py-4 text-sm font-semibold text-gray-100">{m.performance_score()}</th>
				<th class="px-2 py-4 text-sm font-semibold text-gray-100">{m.damage_score()}</th>
				<th class="px-2 py-4 text-sm font-semibold text-gray-100"
					>{m.kills()} ({m.knocks()}) / {m.deaths()} / {m.assists()}</th
				>
				<th class="px-2 py-4 text-sm font-semibold text-gray-300">{m.damage()}</th>
			</tr>
		</thead>
		<tbody>
			{@render teamName(teams[0])}

			{@render playerscores(scores[0], winner === 0)}

			{@render teamName(teams[1])}

			{@render playerscores(scores[1], winner === 1)}
		</tbody>
	</table>
</div>
