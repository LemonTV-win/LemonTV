<script lang="ts">
	import { error } from '@sveltejs/kit';
	import type { PageProps } from './$types';
	import { m } from '$lib/paraglide/messages.js';
	import MapIcon from '$lib/components/MapIcon.svelte';
	import MatchCard from '$lib/components/MatchCard.svelte';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import { MAP_NAMES } from '$lib/data/game';
	import PlayerAgents from './PlayerAgents.svelte';
	import PlayerRadarGraph from '$lib/components/PlayerRadarGraph.svelte';
	import PlayerNetWLGraph from './PlayerNetWLGraph.svelte';
	import PlayerSettings from './PlayerSettings.svelte';
	import { safeGetTimestamp } from '$lib/utils/date';
	import PlayerProfile from './PlayerProfile.svelte';
	let { data }: PageProps = $props();

	if (!data.player) {
		throw error(404, 'Player not found');
	}
</script>

{#if data.player}
	<Breadcrumbs currentTitle={data.player.name} />
	<main class="mx-auto max-w-screen-lg p-4">
		<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
			<PlayerProfile player={data.player} user={data.user} socialPlatforms={data.socialPlatforms} />

			<div class="glass rounded-2xl p-6">
				<h2 class="mb-4 text-xl font-bold">{m.stats()}</h2>
				<div class="grid grid-cols-2 gap-4">
					<div class="rounded-lg bg-slate-800/50 p-4">
						<div class="text-sm text-gray-400">{m.wins()}</div>
						<div class="text-2xl font-bold text-white">{data.playerWins}</div>
					</div>
					<div class="rounded-lg bg-slate-800/50 p-4">
						<div class="text-sm text-gray-400">{m.kd_ratio()}</div>
						<div class="text-2xl font-bold text-white">{data.playerKD.toFixed(2)}</div>
					</div>
					<div class="rounded-lg bg-slate-800/50 p-4">
						<div class="text-sm text-gray-400">{m.win_rate()}</div>
						<div class="text-2xl font-bold text-white">
							{((data.playerStats.winRate ?? 0) * 100).toFixed(1)}%
						</div>
					</div>
					<div class="rounded-lg bg-slate-800/50 p-4">
						<div class="text-sm text-gray-400">{m.games()}</div>
						<div class="text-2xl font-bold text-white">{data.playerStats.totalGames}</div>
					</div>
					<div class="rounded-lg bg-slate-800/50 p-4">
						<div class="text-sm text-gray-400">{m.kills()}</div>
						<div class="text-2xl font-bold text-white">{data.playerStats.totalKills}</div>
					</div>
					<div class="rounded-lg bg-slate-800/50 p-4">
						<div class="text-sm text-gray-400">{m.deaths()}</div>
						<div class="text-2xl font-bold text-white">{data.playerStats.totalDeaths}</div>
					</div>
					<div class="rounded-lg bg-slate-800/50 p-4">
						<div class="text-sm text-gray-400">{m.assists()}</div>
						<div class="text-2xl font-bold text-white">{data.playerStats.totalAssists}</div>
					</div>
					<div class="rounded-lg bg-slate-800/50 p-4">
						<div class="text-sm text-gray-400">{m.avg_score()}</div>
						<div class="text-2xl font-bold text-white">
							{data.playerStats.averageScore.toFixed(0)}
						</div>
					</div>
				</div>
			</div>

			<div class="glass rounded-2xl p-6">
				<h3 class="mb-4 text-lg font-bold">{m.superstrings()}</h3>
				<ul class="styled-scroll flex max-h-100 list-none flex-col gap-2 overflow-y-auto pr-2">
					{#if data.playerAgents.length > 0}
						<PlayerAgents playerAgents={data.playerAgents} />
					{:else}
						<li class="text-center text-gray-400">{m.no_data()}</li>
					{/if}
				</ul>
			</div>

			<div class="glass rounded-2xl p-6">
				<h3 class="mb-4 text-lg font-bold">{m.maps()}</h3>
				<ul class="flex list-none flex-col gap-2">
					{#if data.playerMapStats.length > 0}
						{#each data.playerMapStats as mapStat (mapStat.mapId)}
							{@const total = mapStat.wins + mapStat.losses}
							{@const winPercentage = (mapStat.wins / total) * 100}
							{@const lossPercentage = (mapStat.losses / total) * 100}
							<li
								class="grid grid-cols-[auto_1fr] items-center gap-2 rounded-lg bg-slate-800/50 p-2"
							>
								<MapIcon mapId={mapStat.mapId as import('$lib/data/game').GameMap} />
								<div class="flex flex-col gap-1">
									<div class="flex justify-between text-xs">
										<span class="text-white">{MAP_NAMES[mapStat.mapId]()}</span>
										<span class="text-slate-400">{mapStat.winrate.toFixed(0)}% ({total})</span>
									</div>
									<div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-600">
										<div class="flex h-full">
											<div
												class="h-full bg-green-500"
												style="width: {winPercentage.toFixed(0)}%;"
												title="{mapStat.wins} wins"
											></div>
											<div
												class="h-full bg-red-500"
												style="width: {lossPercentage.toFixed(0)}%;"
												title="{mapStat.losses} losses"
											></div>
										</div>
									</div>
									<div class="flex justify-between text-xs text-gray-400">
										<span>{m.wins_label()}: {mapStat.wins}</span>
										<span>{m.losses_label()}: {mapStat.losses}</span>
									</div>
								</div>
							</li>
						{/each}
					{:else}
						<li class="text-center text-gray-400">{m.no_data()}</li>
					{/if}
				</ul>
			</div>

			<PlayerRadarGraph playerStats={data.playerStats} />

			<PlayerNetWLGraph playerStats={data.playerStats} playerMatches={data.playerMatches} />

			<PlayerSettings proSettings={data.proSettings} />

			{#if data.playerEvents}
				<div class="md:col-span-3">
					<h2 class="my-5 text-xl font-bold">{m.attended_events()}</h2>
					<ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
						{#if data.playerEvents.length > 0}
							{#each data.playerEvents as event (event.slug)}
								{#if event}
									<lib
										class="glass-card grid grid-rows-[auto] gap-2 overflow-hidden rounded-sm bg-gray-800 shadow-2xl"
									>
										<a href="/events/{event.slug}" class="contents">
											<div class="flex h-full w-full items-center justify-center bg-gray-700">
												<img src={event.imageURL} alt={event.name} class="w-full object-cover" />
											</div>
											<div class="h-full p-4 text-white">{event.name}</div>
										</a>
									</lib>
								{/if}
							{/each}
						{:else}
							<li class="text-center text-gray-400">{m.no_data()}</li>
						{/if}
					</ul>
				</div>
			{/if}

			<div class="md:col-span-3">
				<h2 class="my-5 text-xl font-bold">{m.recent_matches()}</h2>
				<ul class="flex flex-col gap-2">
					{#if data.playerMatches.length > 0}
						{#each data.playerMatches.toSorted((a, b) => {
							// Safe date parsing to prevent RangeError
							const dateA = safeGetTimestamp(a.event.date);
							const dateB = safeGetTimestamp(b.event.date);
							return dateB - dateA;
						}) as match (match.id)}
							{#if match}
								<MatchCard
									{match}
									teamIndex={match.playerTeamIndex}
									event={match.event}
									playerSlug={data.player.slug}
									playerId={data.player.id}
									playerAccountIds={data.player.gameAccounts?.map((a) => a.accountId)}
								/>
							{/if}
						{/each}
					{:else}
						<li class="text-center text-gray-400">{m.no_data()}</li>
					{/if}
				</ul>
			</div>
		</div>
	</main>
{/if}
