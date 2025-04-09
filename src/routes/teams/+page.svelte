<script lang="ts">
	import type { PageProps } from './$types';

	import { m } from '$lib/paraglide/messages.js';

	let { data }: PageProps = $props();
</script>

<main class="mx-auto max-w-screen-lg">
	<h1 class="my-10 text-2xl font-bold">{m.teams()}</h1>
	<ul>
		{#each data.teams as team}
			<li class="border-b-1 border-gray-500 bg-gray-800 p-4 shadow-2xl">
				<a href={`/teams/${team.id}`} class="mb-8 text-2xl font-bold">{team.name}</a>
				{#if team.players}
					<ul class="grid grid-cols-3 gap-4 p-4">
						{#each team.players as player}
							<li>
								<a href={`/players/${player.id}`}>{player.name}</a>
							</li>
						{/each}
					</ul>
				{/if}
			</li>
		{/each}
	</ul>
</main>

<style>
	:global(body) {
		background-image:
			linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 1)),
			url(https://klbq-web-cms.strinova.com/prod/strinova_web/images/202411/430c6088-8945-4472-9f79-59a32875b96c.jpg);
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		min-height: 100dvh;
	}
</style>
