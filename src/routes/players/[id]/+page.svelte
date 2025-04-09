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
	</main>
{/if}

<style lang="postcss">
</style>
