<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<header
	class="flex items-center justify-between border-b-1 border-gray-500 bg-gray-800 px-6 py-4 text-white"
>
	<a href="/" class="text-2xl font-bold">🍋 LemonTV</a>
	<nav class="flex items-center gap-4">
		<a href="/news">News</a>
		<a href="/events">Events</a>
		<a href="/teams">Teams</a>
		<a href="/players">Players</a>
	</nav>
</header>

{@render children()}
