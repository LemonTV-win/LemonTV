<script lang="ts">
	import type { Event } from '$lib/data';

	let { event }: { event: Event } = $props();
</script>

<a
	href="/events/{event.id}"
	class="flex min-h-32 items-center gap-2 border-b-1 border-gray-500 bg-gray-800 shadow-2xl"
>
	<img src={event.image} alt={event.name} class="w-full max-w-64" />
	<span class="p-4 text-2xl text-white">{event.name}</span>
</a>
