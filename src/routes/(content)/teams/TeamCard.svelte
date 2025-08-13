<script lang="ts">
	import RegionTag from '$lib/components/tags/RegionTag.svelte';
	import type { Team, TeamPlayer } from '$lib/data/teams';
	import { m } from '$lib/paraglide/messages';
	import { fade, fly } from 'svelte/transition';
	import NationalityFlag from '$lib/components/NationalityFlag.svelte';
	import PlayerAvatar from '$lib/components/PlayerAvatar.svelte';

	let {
		team,
		wins,
		rank,
		expanded = false
	}: {
		team: Team & {
			players: (TeamPlayer & { rating: number; avatarURL: string | null })[];
			logoURL: string | null;
		};
		wins: number;
		rank: number;
		expanded: boolean;
	} = $props();
</script>

<li class="flex flex-col gap-4">
	<button
		class={[
			'group relative flex w-full cursor-pointer flex-col gap-4 overflow-hidden p-4',
			'glass-card'
		]}
		onclick={() => (expanded = !expanded)}
	>
		<div class="relative flex items-center gap-4">
			<span
				class={[
					'flex h-8 w-8 items-center justify-center bg-gray-700 text-sm text-gray-400 transition-all duration-300',
					rank === 1 && 'bg-yellow-500 text-white',
					rank === 2 && 'bg-neutral-500 text-white',
					rank === 3 && 'bg-red-500 text-white'
				]}
			>
				{rank}</span
			>
			<div class="flex w-full flex-col md:flex-row md:justify-between">
				<a
					href={`/teams/${team.slug}`}
					class="flex items-center gap-2 text-xl font-bold md:text-2xl"
				>
					{#if team.logoURL}
						<img src={team.logoURL} alt={team.name} class="h-8 w-8 rounded-full" />
					{/if}
					{team.name}
					{#if team.region}
						<RegionTag region={team.region} class="text-sm" />
					{/if}
				</a>
				<p class="mt-1 text-right text-gray-400 md:mt-0">
					<span class="text-yellow-500">{wins}</span> wins
				</p>
			</div>
		</div>
		{#if expanded && team.players}
			<div
				class="relative mt-2 border-t border-gray-700/50 pt-4"
				in:fly={{ y: 20, duration: 300 }}
				out:fade={{ duration: 200 }}
			>
				<div class="mb-3 flex items-center justify-between">
					<div class="flex flex-col">
						<span class="rounded-full bg-gray-700/50 px-3 py-1 text-sm text-gray-400">
							{team.players?.filter((p) => p.teamPlayer.role !== 'former').length || 0}
							{team.players?.filter((p) => p.teamPlayer.role !== 'former').length === 1
								? m.player()
								: m.players()}
						</span>
						{#if team.players?.some((p) => p.teamPlayer.role === 'former')}
							<span class="text-2xs text-gray-500">
								+{team.players?.filter((p) => p.teamPlayer.role === 'former').length || 0} former players
							</span>
						{/if}
					</div>
				</div>
				<ul class="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
					{#each team.players?.filter((p) => p.teamPlayer.role !== 'former') || [] as teamPlayer, i (teamPlayer.player.id)}
						{@const extendedTeamPlayer = teamPlayer as TeamPlayer & {
							rating: number;
							avatarURL: string | null;
						}}
						<li in:fly={{ y: 20, duration: 300, delay: i * 50 }} out:fade={{ duration: 200 }}>
							{#if extendedTeamPlayer}
								<a
									href={`/players/${extendedTeamPlayer.player.slug}`}
									class="group/player flex flex-col gap-2 rounded-lg border border-gray-700/50 bg-gray-800/50 p-3 text-gray-300 transition-all duration-200 hover:border-gray-600 hover:bg-white/5 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
								>
									<div class="flex items-center gap-3">
										<PlayerAvatar
											player={{
												...extendedTeamPlayer.player,
												avatarURL: extendedTeamPlayer.avatarURL
											}}
											class="h-8 w-8"
										/>
										<div class="flex flex-col">
											<span
												class="font-medium transition-transform duration-200 group-hover/player:translate-x-1"
											>
												{extendedTeamPlayer.player.name}
											</span>
											<span class="text-left text-[0.125em] leading-2.5 text-gray-500">
												{#if extendedTeamPlayer.teamPlayer.role === 'substitute'}
													Substitute
												{:else if extendedTeamPlayer.teamPlayer.role === 'coach'}
													Coach
												{:else if extendedTeamPlayer.teamPlayer.role === 'manager'}
													Manager
												{:else if extendedTeamPlayer.teamPlayer.role === 'owner'}
													Owner
												{/if}
											</span>
										</div>
										<div class="ml-auto flex items-center gap-2">
											{#each extendedTeamPlayer.player.nationalities as nationality, idx (idx)}
												<NationalityFlag {nationality} class="h-5 w-5" />
											{/each}
											{#if extendedTeamPlayer.rating}
												<span class="text-sm font-medium text-yellow-500"
													>{extendedTeamPlayer.rating.toFixed(2)}</span
												>
											{/if}
										</div>
									</div>
									{#if extendedTeamPlayer.teamPlayer.startedOn || extendedTeamPlayer.teamPlayer.endedOn || extendedTeamPlayer.teamPlayer.note}
										<div class="space-y-1 border-t border-gray-700/30 pt-2">
											{#if extendedTeamPlayer.teamPlayer.startedOn || extendedTeamPlayer.teamPlayer.endedOn}
												<div class="flex flex-wrap gap-2 text-xs text-gray-500">
													{#if extendedTeamPlayer.teamPlayer.startedOn}
														<span
															>Started: {new Date(
																extendedTeamPlayer.teamPlayer.startedOn
															).toLocaleDateString()}</span
														>
													{/if}
													{#if extendedTeamPlayer.teamPlayer.endedOn}
														<span
															>Ended: {new Date(
																extendedTeamPlayer.teamPlayer.endedOn
															).toLocaleDateString()}</span
														>
													{/if}
												</div>
											{/if}
											{#if extendedTeamPlayer.teamPlayer.note}
												<div class="text-xs text-gray-400 italic">
													"{extendedTeamPlayer.teamPlayer.note}"
												</div>
											{/if}
										</div>
									{/if}
								</a>
							{/if}
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	</button>
</li>
