<script lang="ts">
	import { error } from '@sveltejs/kit';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	if (!data.team) {
		throw error(404, 'Team not found');
	}
</script>

{#if data.team}
	<main class="mx-auto max-w-screen-lg">
		<h1 class="my-10 text-2xl font-bold">{data.team.name}</h1>
		<p>{data.team.region}</p>
		{#if data.team.logo}
			<img src={data.team.logo} alt={data.team.name} />
		{/if}
		<h2 class="my-5 text-xl font-bold">Active members</h2>
		{#if data.team.players}
			<ul>
				{#each data.team.players as player}
					<li>
						<a href={`/players/${player.id}`}>{player.name}</a>
					</li>
				{/each}
			</ul>
		{/if}
	</main>
{/if}

<style lang="postcss">
</style>
