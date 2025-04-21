<script lang="ts">
	import type { Team } from '$lib/data/teams';

	let {
		team,
		wins,
		rank,
		expanded = false
	}: { team: Team; wins: number; rank: number; expanded: boolean } = $props();
</script>

<li class="flex flex-col gap-4 border-b-1 border-gray-500 bg-gray-800 p-4 shadow-2xl">
	<button
		class="flex w-full cursor-pointer items-center gap-4"
		onclick={() => (expanded = !expanded)}
	>
		<span
			class={[
				'flex h-8 w-8 items-center justify-center bg-gray-700 text-sm text-gray-400',
				rank === 1 && 'bg-yellow-500 text-white',
				rank === 2 && 'bg-neutral-500 text-white',
				rank === 3 && 'bg-red-500 text-white'
			]}
		>
			{rank}</span
		>
		<div class="flex w-full justify-between">
			<a href={`/teams/${team.id}`} class="text-2xl font-bold">{team.name}</a>
			<p class="text-gray-400">
				<span class="text-yellow-500">{wins}</span> wins
			</p>
		</div>
	</button>
	{#if expanded && team.players}
		<ul class="grid grid-cols-3 gap-4 p-4">
			{#each team.players as player}
				<li>
					{#if player}
						<a href={`/players/${player.id}`}>{player.name}</a>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</li>
