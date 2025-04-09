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
		<h1 class="my-10 text-2xl font-bold">{data.player.name}</h1>
		{#if data.player.nationality}
			<p>{data.player.nationality}</p>
		{/if}
		{#if data.player.gameAccounts}
			<ul>
				{#each data.player.gameAccounts as account}
					<li>
						<a href={`/players/${account.id}`}>{account.currentName}</a>
					</li>
				{/each}
			</ul>
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
			<h2 class="my-5 text-xl font-bold">Events</h2>
			<ul>
				{#each data.playerEvents as event}
					{#if event}
						<li>
							<a href={`/events/${event.id}`}>{event.name}</a>
						</li>
					{/if}
				{/each}
			</ul>
		{/if}
	</main>
{/if}

<style lang="postcss">
</style>
