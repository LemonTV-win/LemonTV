<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
</script>

<main class="mx-auto min-h-[calc(100dvh-20em)] max-w-screen-lg">
	<div
		class="mt-6 mb-5 flex flex-col gap-3 px-2 sm:flex-row sm:items-center sm:justify-between sm:px-0"
	>
		<div class="flex items-center gap-3 text-white/80">
			<h1 class="text-2xl font-semibold">{m.news()}</h1>
		</div>
	</div>

	<div class="glass-card-container">
		<div class="glass p-6 text-center">
			<div class="mb-4 text-4xl">📰</div>
			<h3 class="mb-2 text-xl font-semibold text-yellow-400">{m.news_coming_soon()}</h3>
			<p class="text-gray-400">{m.news_placeholder_description()}</p>
		</div>
	</div>
</main>
