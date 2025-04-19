<script lang="ts">
	import { error } from '@sveltejs/kit';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	if (!data.player) {
		throw error(404, 'Player not found');
	}
</script>

{#if data.player}
	<main class="mx-auto max-w-screen-lg">
		<h1 class="my-10 text-2xl font-bold">
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
			<p>{data.player.nationality}</p>
		{/if}
		{#if data.playerTeams}
			<ul>
				{#each data.playerTeams as team}
					{#if team}
						<li>
							<a href={`/teams/${team.id}`}>{team.name}</a>
						</li>
					{/if}
				{/each}
			</ul>
		{/if}
		<h2 class="my-5 text-xl font-bold">Stats</h2>
		<p>Wins: {data.playerWins}</p>
		<h3 class="my-5 text-lg font-bold">Agents</h3>
		{#each data.playerAgents.toSorted((a, b) => b[1] - a[1]) as [character, count]}
			<p>{character}: {count}</p>
		{/each}
		{#if data.playerEvents}
			<h2 class="my-5 text-xl font-bold">Attended Events</h2>
			<ul class="grid grid-cols-3 gap-4">
				{#each data.playerEvents as event}
					{#if event}
						<li class="overflow-clip rounded-sm bg-gray-800 shadow-2xl">
							<a
								href="/events/{event.id}"
								class="flex flex-col items-center gap-2 border-b-1 border-gray-500 bg-gray-800 shadow-2xl"
							>
								<img src={event.image} alt={event.name} class="w-full max-w-64" />
								<span class="p-4 text-white">{event.name}</span>
							</a>
						</li>
					{/if}
				{/each}
			</ul>
		{/if}
		<h2 class="my-5 text-xl font-bold">Recent Matches</h2>
		<ul class="flex flex-col gap-2">
			{#each data.playerMatches as match}
				{#if match}
					<li
						class="grid grid-cols-[1fr_auto_1fr] items-center gap-2 gap-4 rounded-sm bg-gray-800 shadow-2xl"
					>
						<a href={`/matches/${match.id}`} class="contents">
							<span class="text-right text-gray-400">{match.teams[0].team.name}</span>
							<span
								class="p-4 text-white"
								class:bg-green-400={match.winnerId === 1}
								class:bg-red-400={match.winnerId === 2}
							>
								{match.teams[0].score} - {match.teams[1].score}
							</span>
							<span class="text-left text-gray-400">{match.teams[1].team.name}</span>
						</a>
					</li>
				{/if}
			{/each}
		</ul>
	</main>
{/if}

<style lang="postcss">
</style>
