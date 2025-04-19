<script lang="ts">
	import { error } from '@sveltejs/kit';
	import type { PageProps } from './$types';
	import { m } from '$lib/paraglide/messages.js';
	import PlaceholderAvatar from '$assets/placeholder_avatar.png';
	import CharacterIcon from '$lib/components/CharacterIcon.svelte';
	import { calculateWinnerIndex } from '$lib/data';

	let { data }: PageProps = $props();

	if (!data.player) {
		throw error(404, 'Player not found');
	}
</script>

{#if data.player}
	<main class="mx-auto grid max-w-screen-lg grid-cols-1 gap-6 p-4 md:grid-cols-3">
		<div class="flex flex-col gap-2 overflow-hidden rounded-2xl bg-gray-800 shadow-2xl">
			<div class="bg-gradient-to-r from-blue-900 to-purple-900 p-6">
				<img src={PlaceholderAvatar} alt={data.player.name} class="mx-auto w-32 rounded-full" />
			</div>
			<div class="flex flex-col gap-4 p-6">
				<h1 class="text-center text-2xl font-bold">
					{data.player.name}
					<span class="inline-flex gap-2">
						{#if data.player.gameAccounts}
							{#each data.player.gameAccounts as account}
								{#if account.currentName !== data.player.name}
									<span class="text-gray-400">({account.currentName})</span>
								{/if}
							{/each}
						{/if}
					</span>
				</h1>
				{#if data.player.nationality}
					<p class="text-center text-gray-400">{data.player.nationality}</p>
				{/if}
				{#if data.playerTeams}
					<div class="grid grid-cols-2 gap-4 py-4">
						<h3 class="text-lg font-bold">Teams</h3>
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
				{#each data.playerAgents.toSorted((a, b) => b[1] - a[1]) as [character, count]}
					{@const percentage =
						(count / data.playerAgents.reduce((acc, [_, count]) => acc + count, 0)) * 100}
					<li class="grid grid-cols-[auto_1fr] items-center gap-2 rounded-sm shadow-2xl">
						<CharacterIcon {character} />
						<div class="flex flex-col gap-1">
							<div class="flex justify-between text-sm">
								<span class="text-white">{m[character as keyof typeof m]()}</span><span
									class="text-slate-400">{percentage.toFixed(0)}% ({count})</span
								>
							</div>
							<div class="h-2 w-full overflow-hidden rounded-full bg-slate-600">
								<div class="h-full bg-yellow-500" style="width: {percentage.toFixed(0)}%;"></div>
							</div>
						</div>
					</li>
				{/each}
			</ul>
		</div>
		{#if data.playerEvents}
			<div>
				<h2 class="my-5 text-xl font-bold">{m.attended_events()}</h2>
				<ul class="grid grid-cols-2 gap-4">
					{#each data.playerEvents as event}
						{#if event}
							<li
								class="grid grid-rows-[6em_auto] gap-2 overflow-hidden rounded-sm bg-gray-800 shadow-2xl"
							>
								<a href="/events/{event.id}" class="contents">
									<div class="flex h-full items-center justify-center">
										<img src={event.image} alt={event.name} class="w-full max-w-64 object-cover" />
									</div>
									<div class="h-full p-4 text-white">{event.name}</div>
								</a>
							</li>
						{/if}
					{/each}
				</ul>
			</div>
		{/if}
		<div class="col-span-2">
			<h2 class="my-5 text-xl font-bold">{m.recent_matches()}</h2>
			<ul class="flex flex-col gap-2">
				{#each data.playerMatches as match}
					{#if match}
						<li
							class="grid grid-cols-[1fr_auto_1fr] items-center gap-2 gap-4 rounded-sm bg-gray-800 shadow-2xl"
						>
							<a href={`/matches/${match.id}`} class="contents">
								<span
									class="text-right"
									class:text-gray-200={match.playerTeamIndex === 0}
									class:text-gray-400={match.playerTeamIndex === 1}>{match.teams[0].team.name}</span
								>
								<span
									class="p-4 text-white"
									class:bg-green-400={calculateWinnerIndex(match) === match.playerTeamIndex + 1}
									class:bg-red-400={calculateWinnerIndex(match) !== match.playerTeamIndex + 1}
								>
									{match.teams[0].score} - {match.teams[1].score}
								</span>
								<span
									class="text-left"
									class:text-gray-200={match.playerTeamIndex === 1}
									class:text-gray-400={match.playerTeamIndex === 0}>{match.teams[1].team.name}</span
								>
							</a>
						</li>
					{/if}
				{/each}
			</ul>
		</div>
	</main>
{/if}

<style lang="postcss">
</style>
