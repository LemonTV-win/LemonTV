<script lang="ts">
	let {
		event,
		handleEventSelect,
		selectedEventId = $bindable(null)
	}: {
		event: {
			id: string;
			name: string;
			image: string;
			status: string;
			server: string;
			format: string;
			region: string;
			date: string;
		};
		handleEventSelect: (eventId: string) => void;
		selectedEventId: string | null;
	} = $props();
</script>

<button
	class="flex items-start gap-4 rounded-lg border p-4 text-left transition-all {selectedEventId ===
	event.id
		? 'border-yellow-500 bg-gray-700 shadow-lg shadow-yellow-500/10'
		: 'border-gray-700 bg-gray-800 hover:border-gray-600 hover:bg-gray-700'}"
	onclick={() => handleEventSelect(event.id)}
>
	{#if event.image}
		<img
			src={event.image}
			alt={event.name}
			class="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
		/>
	{/if}
	<div class="flex-1">
		<div class="flex items-center justify-between">
			<h3
				class="max-w-[200px] truncate font-semibold {selectedEventId === event.id
					? 'text-white'
					: 'text-gray-300'}"
			>
				{event.name}
			</h3>
			<span
				class="inline-flex rounded-full px-2 text-xs leading-5 font-semibold {event.status ===
				'live'
					? 'bg-green-900 text-green-200'
					: event.status === 'upcoming'
						? 'bg-blue-900 text-blue-200'
						: event.status === 'cancelled'
							? 'bg-red-900 text-red-200'
							: event.status === 'postponed'
								? 'bg-yellow-900 text-yellow-200'
								: 'bg-gray-900 text-gray-200'}"
			>
				{event.status}
			</span>
		</div>
		<div class="mt-1 text-sm {selectedEventId === event.id ? 'text-gray-300' : 'text-gray-500'}">
			<div class="flex items-center gap-2">
				<span>{event.server}</span>
				<span>•</span>
				<span>{event.format}</span>
				<span>•</span>
				<span>{event.region}</span>
			</div>
			<div class="mt-1">
				{#if event.date.includes('/')}
					{(() => {
						const [start, end] = event.date.split('/');
						return `${new Date(start).toLocaleDateString()} - ${new Date(end).toLocaleDateString()}`;
					})()}
				{:else}
					{new Date(event.date).toLocaleDateString()}
				{/if}
			</div>
		</div>
	</div>
</button>
