<script lang="ts">
	import type { PageProps } from './$types';

	import { m } from '$lib/paraglide/messages.js';

	let { data }: PageProps = $props();
</script>

<main class="mx-auto max-w-screen-lg">
	<h1 class="my-10 text-2xl font-bold">{m.players()}</h1>
	<ul>
		{#each data.players as player}
			<li class="border-b-1 border-gray-500 bg-gray-800 p-4 shadow-2xl">
				<a href={`/players/${player.id}`} class="mb-8 font-bold">
					{player.name}
					{#if player.gameAccounts}
						{#each player.gameAccounts as account}
							{#if account.currentName !== player.name}
								<span class="text-gray-400">
									({account.currentName})
								</span>
							{/if}
						{/each}
					{/if}
				</a>
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
