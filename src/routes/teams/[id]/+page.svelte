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
		<!--
  <h2>Ongoing Events</h2>
  
  <h2>Upcoming Events</h2>
  
  <h2>Past Events</h2> -->

		<div>
			<h1>{data.team.name}</h1>
			{#if data.team.logo}
				<img src={data.team.logo} alt={data.team.name} />
			{/if}
			<p>{data.team.region}</p>
			{#if data.team.players}
				<ul>
					{#each data.team.players as player}
						<li>
							<a href={`/players/${player.id}`}>{player.ingame}</a>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</main>
{/if}

<style lang="postcss">
</style>
