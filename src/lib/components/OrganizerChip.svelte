<script lang="ts">
	import type { Organizer } from '$lib/data/organizer';

	export let organizer: Pick<Organizer, 'slug' | 'name' | 'logo'>;
</script>

<a
	href={`/organizers/${organizer.slug}`}
	class="ml-1 inline-flex items-center gap-1 rounded-full bg-slate-700/50 px-1.5 py-1 text-xs text-slate-300"
>
	{#if organizer.logo}
		<img
			src={organizer.logo}
			alt={organizer.name}
			class="h-4 w-4 flex-shrink-0 rounded-full object-cover"
		/>
	{/if}
	{organizer.name}
</a>
