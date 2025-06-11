<script lang="ts">
	import RegionTag from '$lib/components/tags/RegionTag.svelte';
	import type { Team } from '$lib/data/teams';
	import { m } from '$lib/paraglide/messages';
	import { fade, fly } from 'svelte/transition';
	import NationalityFlag from '$lib/components/NationalityFlag.svelte';
	import PlayerAvatar from '$lib/components/PlayerAvatar.svelte';
	import type { Player } from '$lib/data/players';

	let {
		team,
		wins,
		rank,
		expanded = false
	}: {
		team: Team & { players: (Player & { rating: number })[]; logoURL: string | null };
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
					<span class="rounded-full bg-gray-700/50 px-3 py-1 text-sm text-gray-400">
						{team.players.length}
						{team.players.length === 1 ? m.player() : m.players()}
					</span>
				</div>
				<ul class="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
					{#each team.players as player, i}
						<li in:fly={{ y: 20, duration: 300, delay: i * 50 }} out:fade={{ duration: 200 }}>
							{#if player}
								<a
									href={`/players/${player.slug}`}
									class="group/player flex items-center gap-3 rounded-lg border border-gray-700/50 bg-gray-800/50 px-3 py-2 text-gray-300 transition-all duration-200 hover:border-gray-600 hover:bg-white/5 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
								>
									<PlayerAvatar {player} class="h-8 w-8" />
									<span
										class="font-medium transition-transform duration-200 group-hover/player:translate-x-1"
									>
										{player.name}
									</span>
									{#if player.nationality}
										<NationalityFlag nationality={player.nationality} class="h-5 w-5" />
									{/if}
									{#if player.rating}
										<span class="ml-auto text-sm font-medium text-yellow-500"
											>{player.rating.toFixed(2)}</span
										>
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
