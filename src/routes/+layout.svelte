<script lang="ts">
	import '../app.css';

	let { children } = $props();

	import { m } from '$lib/paraglide/messages.js';
</script>

<header
	class="flex items-center justify-between border-b-1 border-gray-500 bg-gray-800 px-6 py-4 text-white"
>
	<a href="/" class="text-2xl font-bold">🍋 LemonTV</a>
	<nav class="flex items-center gap-4">
		<a href="/news">{m.news()}</a>
		<a href="/events">{m.events()}</a>
		<a href="/teams">{m.teams()}</a>
		<a href="/players">{m.players()}</a>
	</nav>
</header>

{@render children()}
