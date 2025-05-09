<script lang="ts">
	import RegionTag from '$lib/components/tags/RegionTag.svelte';
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
		<div class="flex w-full flex-col md:flex-row md:justify-between">
			<a href={`/teams/${team.slug}`} class="flex items-center gap-2 text-xl font-bold md:text-2xl">
				{team.name}
				{#if team.region}
					<RegionTag region={team.region} class="text-sm" />
				{/if}
			</a>
			<p class="mt-1 text-right text-gray-400 md:mt-0">
				<span class="text-yellow-500">{wins}</span> wins
			</p>
		</div>
	</button>
	{#if expanded && team.players}
		<ul class="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3">
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
