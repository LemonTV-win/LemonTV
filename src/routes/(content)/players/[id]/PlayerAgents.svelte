<script lang="ts">
	import CharacterIcon from '$lib/components/CharacterIcon.svelte';
	import { CHARACTER_NAMES, type Character } from '$lib/data/game';

	let { playerAgents }: { playerAgents: [Character, number][] } = $props();
</script>

{#each playerAgents.toSorted((a, b) => b[1] - a[1]) as [character, count] (character)}
	{@const percentage = (count / playerAgents.reduce((acc, [_char, count]) => acc + count, 0)) * 100}
	<li class="grid grid-cols-[auto_1fr] items-center gap-2 rounded-lg bg-slate-800/50 p-3">
		<CharacterIcon {character} />
		<div class="flex flex-col gap-1">
			<div class="flex justify-between text-sm">
				<span class="text-white">{CHARACTER_NAMES[character]()}</span>
				<span class="text-slate-400">{percentage.toFixed(0)}% ({count})</span>
			</div>
			<div class="h-2 w-full overflow-hidden rounded-full bg-slate-600">
				<div class="h-full bg-yellow-500" style="width: {percentage.toFixed(0)}%;"></div>
			</div>
		</div>
	</li>
{/each}
