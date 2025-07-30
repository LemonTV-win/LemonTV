<script lang="ts">
	import { error } from '@sveltejs/kit';
	import type { PageProps } from './$types';
	import { m } from '$lib/paraglide/messages.js';
	import CharacterIcon from '$lib/components/CharacterIcon.svelte';
	import MapIcon from '$lib/components/MapIcon.svelte';
	import PlayerAvatar from '$lib/components/PlayerAvatar.svelte';
	import MatchCard from '$lib/components/MatchCard.svelte';
	import SocialLinks from '$lib/components/SocialLinks.svelte';
	import NationalityFlag from '$lib/components/NationalityFlag.svelte';
	import { getAllNames } from '$lib/data/players';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import ContentActionLink from '$lib/components/ContentActionLink.svelte';

	let { data }: PageProps = $props();

	if (!data.player) {
		throw error(404, 'Player not found');
	}
</script>

{#if data.player}
	<Breadcrumbs currentTitle={data.player.name} />
	<main class="mx-auto max-w-screen-lg p-4">
		<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
			<div class="glass overflow-hidden rounded-2xl">
				<div class="bg-gradient-to-r from-blue-900 to-purple-900 p-6">
					<PlayerAvatar player={data.player} class="mx-auto h-32 w-32" />
				</div>
				<div class="flex flex-col gap-4 p-6">
					<div class="flex flex-col items-center gap-2">
						<h1 class="flex flex-col items-center gap-2 text-center text-2xl font-bold">
							<span class="text-white">{data.player.name}</span>
							<span class="inline-flex flex-col gap-2">
								{#each getAllNames(data.player).filter((name) => name !== data.player.name) as name (name)}
									<span class="text-gray-400">({name})</span>
								{/each}
							</span>
						</h1>
						{#if ['admin', 'editor'].some((role) => data.user?.roles.includes(role))}
							<ContentActionLink
								href={`/admin/players?action=edit&id=${data.player.id}`}
								type="edit"
							/>
						{/if}
					</div>
					{#if data.player.nationalities.length}
						<p class="text-center text-gray-400">
							{#each data.player.nationalities as nationality, idx (idx)}
								<NationalityFlag {nationality} showLabel />
							{/each}
						</p>
					{/if}
					{#if data.player.socialAccounts?.length}
						<div class="flex justify-center">
							<SocialLinks
								socialAccounts={data.player.socialAccounts}
								socialPlatforms={data.socialPlatforms}
								iconSize="h-5 w-5"
							/>
						</div>
					{/if}
					{#if data.playerTeams}
						<div class="grid grid-cols-1 gap-4 py-4 sm:grid-cols-[auto_1fr]">
							<h3 class="text-lg font-bold">{m.teams()}</h3>
							<ul class="text-right">
								{#each data.playerTeams as team (team.teams.slug)}
									{#if team}
										<li>
											<a
												href={`/teams/${team.teams.slug}`}
												class="text-yellow-500 hover:text-yellow-400"
											>
												{team.teams.name}
											</a>
										</li>
									{/if}
								{/each}
							</ul>
						</div>
					{/if}
				</div>
			</div>

			<div class="glass rounded-2xl p-6">
				<h2 class="mb-4 text-xl font-bold">{m.stats()}</h2>
				<div class="grid grid-cols-2 gap-4">
					<div class="rounded-lg bg-slate-800/50 p-4">
						<div class="text-sm text-gray-400">{m.wins()}</div>
						<div class="text-2xl font-bold text-white">{data.playerWins}</div>
					</div>
					<div class="rounded-lg bg-slate-800/50 p-4">
						<div class="text-sm text-gray-400">KD</div>
						<div class="text-2xl font-bold text-white">{data.playerKD.toFixed(2)}</div>
					</div>
				</div>
			</div>

			<div class="glass rounded-2xl p-6">
				<h3 class="mb-4 text-lg font-bold">{m.superstrings()}</h3>
				<ul class="flex list-none flex-col gap-4">
					{#if data.playerAgents.length > 0}
						{#each data.playerAgents.toSorted((a, b) => b[1] - a[1]) as [character, count] (character)}
							{@const percentage =
								(count / data.playerAgents.reduce((acc, [_, count]) => acc + count, 0)) * 100}
							<li
								class="grid grid-cols-[auto_1fr] items-center gap-2 rounded-lg bg-slate-800/50 p-4"
							>
								<CharacterIcon {character} />
								<div class="flex flex-col gap-1">
									<div class="flex justify-between text-sm">
										<span class="text-white">{m[character]()}</span>
										<span class="text-slate-400">{percentage.toFixed(0)}% ({count})</span>
									</div>
									<div class="h-2 w-full overflow-hidden rounded-full bg-slate-600">
										<div
											class="h-full bg-yellow-500"
											style="width: {percentage.toFixed(0)}%;"
										></div>
									</div>
								</div>
							</li>
						{/each}
					{:else}
						<li class="text-center text-gray-400">{m.no_data()}</li>
					{/if}
				</ul>
			</div>

			<div class="glass rounded-2xl p-6">
				<h3 class="mb-4 text-lg font-bold">{m.maps()}</h3>
				<ul class="flex list-none flex-col gap-4">
					{#if data.playerMapStats.length > 0}
						{#each data.playerMapStats as mapStat (mapStat.mapId)}
							{@const total = mapStat.wins + mapStat.losses}
							{@const winPercentage = (mapStat.wins / total) * 100}
							{@const lossPercentage = (mapStat.losses / total) * 100}
							<li
								class="grid grid-cols-[auto_1fr] items-center gap-2 rounded-lg bg-slate-800/50 p-4"
							>
								<MapIcon mapId={mapStat.mapId as import('$lib/data/game').GameMap} />
								<div class="flex flex-col gap-1">
									<div class="flex justify-between text-sm">
										<span class="text-white">{mapStat.mapId}</span>
										<span class="text-slate-400">{mapStat.winrate.toFixed(0)}% ({total})</span>
									</div>
									<div class="h-2 w-full overflow-hidden rounded-full bg-slate-600">
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
										<span>W: {mapStat.wins}</span>
										<span>L: {mapStat.losses}</span>
									</div>
								</div>
							</li>
						{/each}
					{:else}
						<li class="text-center text-gray-400">{m.no_data()}</li>
					{/if}
				</ul>
			</div>

			{#if data.playerEvents}
				<div class="md:col-span-3">
					<h2 class="my-5 text-xl font-bold">{m.attended_events()}</h2>
					<ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
						{#if data.playerEvents.length > 0}
							{#each data.playerEvents as event (event.slug)}
								{#if event}
									<li
										class="grid grid-rows-[auto] gap-2 overflow-hidden rounded-sm bg-gray-800 shadow-2xl"
									>
										<a href="/events/{event.slug}" class="contents">
											<div class="flex h-full w-full items-center justify-center bg-gray-700">
												<img src={event.imageURL} alt={event.name} class="w-full object-cover" />
											</div>
											<div class="h-full p-4 text-white">{event.name}</div>
										</a>
									</li>
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
							const dateA = 'event' in a ? new Date(a.event.date).getTime() : new Date(a.eventDate).getTime();
							const dateB = 'event' in b ? new Date(b.event.date).getTime() : new Date(b.eventDate).getTime();
							return dateB - dateA;
						}) as match (match.id)}
							{#if match}
								{#if 'event' in match}
									<MatchCard
										{match}
										teamIndex={match.playerTeamIndex}
										event={match.event}
										teams={data.teams}
									/>
								{:else}
									<!-- Handle server match data structure -->
									<div class="glass rounded-lg p-4">
										<div class="flex items-center justify-between">
											<div class="flex items-center gap-4">
												<div class="text-sm text-gray-400">{match.eventName}</div>
												<div class="text-sm text-gray-400">{match.eventDate}</div>
											</div>
											<div class="text-sm text-gray-400">Match #{match.id}</div>
										</div>
									</div>
								{/if}
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
