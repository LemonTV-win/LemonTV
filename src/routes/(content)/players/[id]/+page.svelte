<script lang="ts">
	import { error } from '@sveltejs/kit';
	import type { PageProps } from './$types';
	import { m } from '$lib/paraglide/messages.js';
	import CharacterIcon from '$lib/components/CharacterIcon.svelte';
	import PlayerAvatar from '$lib/components/PlayerAvatar.svelte';
	import MatchCard from '$lib/components/MatchCard.svelte';
	import SocialLinks from '$lib/components/SocialLinks.svelte';
	import NationalityFlag from '$lib/components/NationalityFlag.svelte';
	import { getAllNames } from '$lib/data/players';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';

	let { data }: PageProps = $props();

	if (!data.player) {
		throw error(404, 'Player not found');
	}
</script>

<svelte:head>
	<title>{data.player?.name ?? m.players()} | LemonTV</title>
</svelte:head>

{#if data.player}
	<Breadcrumbs currentTitle={data.player.name} />
	<main class="mx-auto grid max-w-screen-lg grid-cols-1 gap-6 p-4 md:grid-cols-3">
		<div class="flex flex-col gap-2 overflow-hidden rounded-2xl bg-gray-800 shadow-2xl">
			<div class="bg-gradient-to-r from-blue-900 to-purple-900 p-6">
				<PlayerAvatar player={data.player} class="mx-auto h-32 w-32" />
			</div>
			<div class="flex flex-col gap-4 p-6">
				<h1 class="flex flex-col items-center gap-2 text-center text-2xl font-bold">
					<span class="text-white">{data.player.name}</span>
					<span class="inline-flex flex-col gap-2">
						{#each getAllNames(data.player).filter((name) => name !== data.player.name) as name}
							<span class="text-gray-400">({name})</span>
						{/each}
					</span>
				</h1>
				{#if data.player.nationality}
					<p class="text-center text-gray-400">
						<NationalityFlag nationality={data.player.nationality} showLabel />
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
					<div class="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2">
						<h3 class="text-lg font-bold">{m.teams()}</h3>
						<ul>
							{#each data.playerTeams as team}
								{#if team}
									<li>
										<a href={`/teams/${team.id}`}>{team.name}</a>
									</li>
								{/if}
							{/each}
						</ul>
					</div>
				{/if}
			</div>
		</div>
		<div class="flex flex-col">
			<h2 class="my-5 text-xl font-bold">{m.stats()}</h2>
			<div class="flex flex-col gap-2 rounded-sm bg-gray-800 p-4 shadow-2xl">
				<table>
					<tbody>
						<tr>
							<td>{m.wins()}</td>
							<td>{data.playerWins}</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
		<div>
			<h3 class="my-5 text-lg font-bold">{m.superstrings()}</h3>
			<ul class="flex list-none flex-col gap-4 rounded-sm bg-gray-800 p-4 shadow-2xl">
				{#if data.playerAgents.length > 0}
					{#each data.playerAgents.toSorted((a, b) => b[1] - a[1]) as [character, count]}
						{@const percentage =
							(count / data.playerAgents.reduce((acc, [_, count]) => acc + count, 0)) * 100}
						<li class="grid grid-cols-[auto_1fr] items-center gap-2 rounded-sm shadow-2xl">
							<CharacterIcon {character} />
							<div class="flex flex-col gap-1">
								<div class="flex justify-between text-sm">
									<span class="text-white">{m[character]()}</span><span class="text-slate-400"
										>{percentage.toFixed(0)}% ({count})</span
									>
								</div>
								<div class="h-2 w-full overflow-hidden rounded-full bg-slate-600">
									<div class="h-full bg-yellow-500" style="width: {percentage.toFixed(0)}%;"></div>
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
						{#each data.playerEvents as event}
							{#if event}
								<li
									class="grid grid-rows-[auto] gap-2 overflow-hidden rounded-sm bg-gray-800 shadow-2xl"
								>
									<a href="/events/{event.id}" class="contents">
										<div class="flex h-full w-full items-center justify-center bg-gray-700">
											<img src={event.image} alt={event.name} class="w-full object-cover" />
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
					{#each data.playerMatches as match}
						{#if match}
							<MatchCard {match} teamIndex={match.playerTeamIndex} event={match.event} />
						{/if}
					{/each}
				{:else}
					<li class="text-center text-gray-400">{m.no_data()}</li>
				{/if}
			</ul>
		</div>
	</main>
{/if}

<style lang="postcss">
</style>
