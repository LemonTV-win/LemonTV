<script lang="ts">
	import type { PlayerScore } from '$lib/data/matches';

	let { scores }: { scores: [PlayerScore[], PlayerScore[]] } = $props();

	import CharacterIcon from './CharacterIcon.svelte';
</script>

{#snippet playerscores(scores: PlayerScore[])}
	{#each scores as score}
		<tr>
			<td class="text-center">
				<div class="flex items-center justify-center gap-2">
					{#each score.characters as character}
						<CharacterIcon {character} />
					{/each}
				</div>
			</td>
			<td class="text-center">{score.player}</td>
			<td class="text-center">{score.score}</td>
			<td class="text-center">{score.kills} ({score.knocks}) / {score.deaths} / {score.assists}</td>
			<td class="text-center">{score.damage}</td>
		</tr>
	{/each}
{/snippet}

<table class="w-auto">
	<thead>
		<tr class="rounded-full bg-gray-100/50 text-center">
			<th class="py-3">Characters</th>
			<th class="py-3">Player</th>
			<th class="py-3">Score</th>
			<th class="py-3">K (KN) / D / A</th>
			<th class="py-3">Damage</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td colspan="6" class="h-6"></td>
		</tr>
		{@render playerscores(scores[0])}
		<tr>
			<td colspan="6" class="h-6"></td>
		</tr>
		{@render playerscores(scores[1])}
	</tbody>
</table>
