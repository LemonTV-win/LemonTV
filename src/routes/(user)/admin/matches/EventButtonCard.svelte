<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { safeFormatEventDate } from '$lib/utils/date';

	let {
		event,
		onSelect
	}: {
		event: {
			id: string;
			name: string;
			slug: string;
			image?: string;
			imageURL?: string;
			status: string;
			server: string;
			format: string;
			region: string;
			date: string;
			stats?: { stageCount: number; matchCount: number; gameCount: number };
		};
		onSelect: (eventId: string) => void;
	} = $props();
</script>

<div
	class="group cursor-pointer rounded-lg border border-gray-700 bg-gray-800 p-4 text-left transition-all hover:border-gray-600 hover:bg-gray-700 hover:shadow-lg hover:shadow-yellow-500/10"
	role="button"
	tabindex="0"
	onclick={() => onSelect(event.id)}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onSelect(event.id);
		}
	}}
>
	<div class="mb-2 flex items-center gap-3">
		{#if event.imageURL}
			<img src={event.imageURL} alt={event.name} class="h-12 w-12 rounded-lg object-cover" />
		{/if}
		<div>
			<h3 class="font-semibold text-white transition-colors group-hover:text-yellow-400">
				{event.name}
			</h3>
			<p class="text-sm text-gray-400">{event.slug}</p>
		</div>
	</div>

	<div class="mt-4 space-y-3 border-t border-gray-700 pt-4">
		<div class="flex items-center justify-between text-sm">
			<span class=" text-gray-400">{m.status()}</span>
			<span
				class="inline-flex rounded-full px-2 text-xs leading-5 font-semibold {event.status ===
				'live'
					? 'bg-green-900 text-green-200'
					: event.status === 'upcoming'
						? 'bg-blue-900 text-blue-200'
						: event.status === 'finished'
							? 'bg-green-900 text-green-200'
							: event.status === 'cancelled'
								? 'bg-red-900 text-red-200'
								: event.status === 'postponed'
									? 'bg-yellow-900 text-yellow-200'
									: 'bg-gray-900 text-gray-200'}"
			>
				{event.status}
			</span>
		</div>
		<div class="flex items-center justify-between text-sm">
			<span class="text-gray-400">{m.server()}</span>
			<span class="text-gray-300">{event.server}</span>
		</div>
		<div class="flex items-center justify-between text-sm">
			<span class="text-gray-400">{m.region()}</span>
			<span class="text-gray-300">{event.region}</span>
		</div>
		<div class="flex items-center justify-between text-sm">
			<span class="text-gray-400">{m.format()}</span>
			<span class="text-gray-300">{event.format}</span>
		</div>
		<div class="flex items-center justify-between text-sm">
			<span class="text-gray-400">{m.date()}</span>
			<span class="text-gray-300">{safeFormatEventDate(event.date)}</span>
		</div>
	</div>

	{#if event.stats}
		<div class="mt-4 flex items-center justify-between border-t border-gray-700 pt-4">
			<div class="flex gap-4 text-xs text-gray-400">
				<span>{event.stats.stageCount} stages</span>
				<span>{event.stats.matchCount} matches</span>
				<span>{event.stats.gameCount} games</span>
			</div>
		</div>
	{/if}
</div>
