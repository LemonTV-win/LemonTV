<script lang="ts">
	import PlayerAvatar from '$lib/components/PlayerAvatar.svelte';
	import CharacterIcon from '$lib/components/CharacterIcon.svelte';
	import { m } from '$lib/paraglide/messages';
	import { getAllNames } from '$lib/data/players';
	import type { TeamPlayer } from '$lib/data/teams';

	let {
		teamPlayer,
		teamMemberStatistics
	}: {
		teamPlayer: TeamPlayer & { rating?: number; avatarURL?: string | null };
		teamMemberStatistics?: Record<
			string,
			{ rating: number; kd: number; characters: [any, number][] }
		> | null;
	} = $props();
</script>

<li
	class="glass gap-y- grid w-full min-w-32 grid-cols-[auto_1fr] grid-rows-[auto_auto] items-center gap-x-4 gap-y-2 rounded-sm px-2 py-2 sm:w-auto"
>
	<PlayerAvatar
		player={{ ...teamPlayer.player, avatarURL: teamPlayer.avatarURL }}
		class="row-span-2 h-16 w-16 rounded-full"
	/>
	<a class="flex gap-1 px-1 text-lg font-semibold" href={`/players/${teamPlayer.player.id}`}
		>{teamPlayer.player
			.name}{#each getAllNames(teamPlayer.player).filter((name) => name !== teamPlayer.player.name) as name (name)}
			<span class="text-xs text-gray-400">
				({name})
			</span>
		{/each}
	</a>
	{#if teamPlayer.player.id}
		{#if teamMemberStatistics?.[teamPlayer.player.id]}
			<div class="flex gap-2">
				<div class="flex min-w-16 flex-col items-center rounded-sm bg-gray-700/50 px-2 py-1">
					<span class="text-xs text-gray-400">{m.rating()}</span>
					<span class="text-sm text-yellow-300">
						{teamMemberStatistics[teamPlayer.player.id].rating.toFixed(2)}
					</span>
				</div>
				<div class="flex min-w-16 flex-col items-center rounded-sm bg-gray-700/50 px-2 py-1">
					<span class="text-xs text-gray-400">{m.kd_ratio()}</span>
					<span class="text-sm">
						{teamMemberStatistics[teamPlayer.player.id].kd.toFixed(2)}
					</span>
				</div>
				<div class="flex flex-wrap items-center justify-center -space-x-3">
					{#each teamMemberStatistics[teamPlayer.player.id].characters
						.toSorted((a, b) => b[1] - a[1])
						.map(([character]) => character)
						.slice(0, 3)
						.concat(Array(3).fill(null))
						.slice(0, 3) as character, i (i)}
						<CharacterIcon
							{character}
							class={`h-3 w-3 shadow-md ${i === 0 ? 'z-3' : i === 1 ? 'z-2' : 'z-1'}`}
						/>
					{/each}
				</div>
			</div>
		{/if}
	{/if}
</li>
