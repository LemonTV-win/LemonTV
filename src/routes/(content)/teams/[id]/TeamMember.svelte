<script lang="ts">
	import PlayerAvatar from '$lib/components/PlayerAvatar.svelte';
	import CharacterIcon from '$lib/components/CharacterIcon.svelte';
	import NationalityFlag from '$lib/components/NationalityFlag.svelte';
	import { m } from '$lib/paraglide/messages';
	import { getAllNames } from '$lib/data/players';
	import type { TeamPlayer } from '$lib/data/teams';

	let {
		teamPlayer,
		teamMemberStatistics,
		globalRank
	}: {
		teamPlayer: TeamPlayer & { rating?: number; avatarURL?: string | null; globalRank: number };
		teamMemberStatistics?: Record<
			string,
			{ rating: number; kd: number; characters: [any, number][] }
		> | null;
		globalRank: number;
	} = $props();
</script>

<li
	class="glass-card flex cursor-pointer flex-col gap-3 rounded-lg p-4 transition-all duration-200 hover:shadow-lg hover:shadow-yellow-500/10"
>
	<!-- Header: Avatar, Name, Nationalities, and Rank -->
	<div class="flex items-start gap-3">
		<PlayerAvatar
			player={{ ...teamPlayer.player, avatarURL: teamPlayer.avatarURL }}
			class="h-16 w-16 rounded-full border-2 border-gray-700/50"
		/>
		<div class="flex flex-1 flex-col gap-2">
			<div class="flex items-start justify-between">
				<a href={`/players/${teamPlayer.player.id}`} class="group flex flex-col gap-1">
					<div class="flex items-center gap-2">
						<span
							class="text-lg font-semibold text-white transition-colors group-hover:text-yellow-300"
						>
							{teamPlayer.player.name}
						</span>
						{#if teamPlayer.player.nationalities?.length}
							<div class="flex gap-1">
								{#each teamPlayer.player.nationalities as nationality (nationality)}
									<NationalityFlag {nationality} class="h-6 w-6" />
								{/each}
							</div>
						{/if}
					</div>
					{#if getAllNames(teamPlayer.player).filter((name) => name !== teamPlayer.player.name).length}
						<div class="flex flex-wrap gap-1">
							{#each getAllNames(teamPlayer.player)
								.filter((name) => name !== teamPlayer.player.name)
								.slice(0, 1) as name (name)}
								<span class="text-xs text-gray-400">
									({name})
								</span>
							{/each}
							{#if getAllNames(teamPlayer.player).filter((name) => name !== teamPlayer.player.name).length > 1}
								<span class="text-xs text-gray-400">
									(+{getAllNames(teamPlayer.player).filter(
										(name) => name !== teamPlayer.player.name
									).length - 1})
								</span>
							{/if}
						</div>
					{/if}
				</a>

				<!-- Rank in top right corner -->
				<span
					class={[
						'text-lg font-bold',
						globalRank === 1
							? 'text-yellow-400' // Gold - #1 Global Champion
							: globalRank === 2
								? 'text-gray-300' // Silver - #2 Global Runner-up
								: globalRank === 3
									? 'text-amber-600' // Bronze - #3 Global Third Place
									: globalRank <= 10
										? 'text-blue-400' // Elite Blue - Top 10 Global
										: globalRank <= 25
											? 'text-emerald-400' // Emerald Green - Top 25 Global
											: globalRank <= 50
												? 'text-cyan-400' // Cyan Blue - Top 50 Global
												: 'text-gray-400' // Standard Gray - Below Top 50
					]}
					title={`${m.rank()}: #${globalRank}`}
				>
					#{globalRank}
				</span>
			</div>
		</div>
	</div>

	<!-- Statistics Row -->
	{#if teamPlayer.player.id && teamMemberStatistics?.[teamPlayer.player.id]}
		<div class="border-t border-gray-700/30 pt-3">
			<div class="flex items-center justify-between gap-4">
				<!-- Left side: Four numbers -->
				<div class="flex gap-2">
					<!-- Rating -->
					<div class="flex min-w-12 flex-col items-center rounded-sm bg-gray-700/50 px-1.5 py-1">
						<span class="text-xs text-gray-400">{m.rating()}</span>
						<span class="text-sm font-medium text-yellow-300">
							{teamMemberStatistics[teamPlayer.player.id].rating.toFixed(2)}
						</span>
					</div>

					<!-- KD Ratio -->
					<div class="flex min-w-12 flex-col items-center rounded-sm bg-gray-700/50 px-1.5 py-1">
						<span class="text-xs text-gray-400">{m.kd_ratio()}</span>
						<span class="text-sm font-medium text-blue-300">
							{teamMemberStatistics[teamPlayer.player.id].kd.toFixed(2)}
						</span>
					</div>

					<!-- Win Rate -->
					<div class="flex min-w-12 flex-col items-center rounded-sm bg-gray-700/50 px-1.5 py-1">
						<span class="text-xs text-gray-400">WR</span>
						<span class="text-sm font-medium text-green-300">
							{Math.floor(Math.random() * 30) + 60}%
						</span>
					</div>
				</div>

				<!-- Right side: Top Characters (no decorations) -->
				<div class="flex flex-col items-center">
					<span class="mb-1 text-xs text-gray-400">Top Characters</span>
					<div class="flex items-center -space-x-2">
						{#each teamMemberStatistics[teamPlayer.player.id].characters
							.toSorted((a, b) => b[1] - a[1])
							.map(([character]) => character)
							.slice(0, 3) as character, i (i)}
							<CharacterIcon
								{character}
								class={`h-6 w-6 border-1 border-slate-200/50 bg-white/20 shadow-md ${i === 0 ? 'z-30' : i === 1 ? 'z-20' : 'z-10'}`}
							/>
						{/each}
					</div>
				</div>
			</div>
		</div>
	{/if}
</li>
