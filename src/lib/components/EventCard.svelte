<script lang="ts">
	import type { Event } from '$lib/data/events';

	let { event }: { event: Event } = $props();
</script>

<a
	href="/events/{event.id}"
	class="flex min-h-32 flex-col items-center gap-2 border-b-1 border-gray-500 bg-gray-800 shadow-2xl sm:flex-row"
>
	<img src={event.image} alt={event.name} class="w-full max-w-full sm:max-w-64" />
	<span class="p-4 text-xl text-white sm:text-2xl">{event.name}</span>
</a>
