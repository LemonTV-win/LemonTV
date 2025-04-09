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
		<!-- <h2 class="my-5 text-xl font-bold">Active members</h2> -->
		<!-- {#if data.player.teams}
			<ul>
				{#each data.player.teams as team}
					<li>
						<a href={`/teams/${team.id}`}>{team.name}</a>
					</li>
				{/each}
			</ul>
		{/if} -->
	</main>
{/if}

<style lang="postcss">
</style>
