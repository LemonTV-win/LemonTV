<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
</script>

<svelte:head>
	<title>{m.news()} | LemonTV</title>
</svelte:head>

<main class="mx-auto min-h-[calc(100dvh-20em)] max-w-screen-lg">
	<h1 class="my-10 text-2xl font-bold">{m.news()}</h1>
	<div class="glass-card-container">
		<div class="glass p-6 text-center">
			<div class="mb-4 text-4xl">📰</div>
			<h3 class="mb-2 text-xl font-semibold text-yellow-400">{m.news_coming_soon()}</h3>
			<p class="text-gray-400">{m.news_placeholder_description()}</p>
		</div>
	</div>
</main>
