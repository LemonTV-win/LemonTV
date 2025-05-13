<!-- src/routes/(user)/admin/events/EventEdit.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Event, Organizer, EventOrganizer } from '$lib/server/db/schema';
	import { m } from '$lib/paraglide/messages';

	let {
		event,
		organizers,
		eventOrganizers,
		onCancel,
		onSuccess: onsuccess
	}: {
		event: Partial<Event>;
		organizers: Organizer[];
		eventOrganizers: EventOrganizer[];
		onCancel: () => void;
		onSuccess: () => void;
	} = $props();

	let newEvent = $state({
		id: event.id || '',
		name: event.name || '',
		slug: event.slug || '',
		server: event.server || 'strinova',
		format: event.format || 'online',
		region: event.region || 'Global',
		status: event.status || 'upcoming',
		capacity: event.capacity || 0,
		date: event.date || new Date().toISOString().split('T')[0],
		image: event.image || '',
		official: event.official || false,
		organizers: eventOrganizers.map((eo) => eo.organizerId)
	});
	let errorMessage = $state('');
	let successMessage = $state('');

	const statusOptions = ['upcoming', 'live', 'finished', 'cancelled', 'postponed'];
	const serverOptions = {
		strinova: 'Strinova',
		calabiyau: 'CalabiYau'
	};
	const formatOptions = ['online', 'lan', 'hybrid'];
	const regionOptions = ['Global', 'APAC', 'EU', 'CN', 'NA', 'SA', 'AF', 'OC'];
</script>

<form
	method="POST"
	action={event.id ? '?/update' : '?/create'}
	use:enhance={() => {
		return async ({ result }) => {
			if (result.type === 'success') {
				onsuccess();
				onCancel();
			} else if (result.type === 'failure') {
				errorMessage =
					typeof result.data?.error === 'string' ? result.data.error : 'Failed to save event';
			} else if (result.type === 'error') {
				errorMessage = result.error?.message || 'An error occurred';
			}
		};
	}}
	class="flex h-full flex-col"
>
	{#if errorMessage}
		<div class="mb-4 rounded-md bg-red-900/50 p-4 text-red-200" role="alert">
			<span class="block sm:inline">{errorMessage}</span>
		</div>
	{/if}

	<div
		class="flex-1 space-y-4 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb:hover]:bg-slate-500 [&::-webkit-scrollbar-track]:bg-slate-800"
	>
		{#if event.id}
			<div>
				<label class="block text-sm font-medium text-slate-300" for="eventId">ID</label>
				<input
					type="text"
					id="eventId"
					name="id"
					value={event.id}
					readonly
					class="block w-full rounded-md border border-slate-700 bg-slate-800/50 px-3 py-2 text-slate-400 placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none [&:read-only]:cursor-default [&:read-only]:opacity-75 [&:read-only]:select-none"
				/>
			</div>
		{/if}

		<div>
			<label class="block text-sm font-medium text-slate-300" for="name">{m.name()}</label>
			<input
				type="text"
				id="name"
				name="name"
				bind:value={newEvent.name}
				required
				class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
			/>
		</div>

		<div>
			<label class="block text-sm font-medium text-slate-300" for="slug">{m.slug()}</label>
			<input
				type="text"
				id="slug"
				name="slug"
				bind:value={newEvent.slug}
				required
				class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
			/>
		</div>

		<div>
			<label class="block text-sm font-medium text-slate-300" for="server">{m.server()}</label>
			<select
				id="server"
				name="server"
				bind:value={newEvent.server}
				required
				class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
			>
				{#each Object.entries(serverOptions) as [server, label]}
					<option value={server}>{label}</option>
				{/each}
			</select>
		</div>

		<div>
			<label class="block text-sm font-medium text-slate-300" for="format">{m.format()}</label>
			<select
				id="format"
				name="format"
				bind:value={newEvent.format}
				required
				class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
			>
				{#each formatOptions as format}
					<option value={format}>{format}</option>
				{/each}
			</select>
		</div>

		<div>
			<label class="block text-sm font-medium text-slate-300" for="region">{m.region()}</label>
			<select
				id="region"
				name="region"
				bind:value={newEvent.region}
				required
				class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
			>
				{#each regionOptions as region}
					<option value={region}>{region}</option>
				{/each}
			</select>
		</div>

		<div>
			<label class="block text-sm font-medium text-slate-300" for="status">{m.status()}</label>
			<select
				id="status"
				name="status"
				bind:value={newEvent.status}
				required
				class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
			>
				{#each statusOptions as status}
					<option value={status}>{status}</option>
				{/each}
			</select>
		</div>

		<div>
			<label class="block text-sm font-medium text-slate-300" for="capacity">{m.capacity()}</label>
			<input
				type="number"
				id="capacity"
				name="capacity"
				bind:value={newEvent.capacity}
				required
				min="0"
				class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
			/>
		</div>

		<div>
			<label class="block text-sm font-medium text-slate-300" for="date">{m.date()}</label>
			<input
				type="date"
				id="date"
				name="date"
				bind:value={newEvent.date}
				required
				class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
			/>
		</div>

		<div>
			<label class="block text-sm font-medium text-slate-300" for="image">{m.image()}</label>
			<input
				type="url"
				id="image"
				name="image"
				bind:value={newEvent.image}
				required
				class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
			/>
		</div>

		<div>
			<label class="block text-sm font-medium text-slate-300" for="organizers">Organizers</label>
			<select
				id="organizers"
				name="organizers"
				bind:value={newEvent.organizers}
				multiple
				class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
			>
				{#each organizers as organizer}
					<option value={organizer.id}>{organizer.name}</option>
				{/each}
			</select>
			<p class="mt-1 text-sm text-slate-400">Hold Ctrl/Cmd to select multiple organizers</p>
		</div>

		<div class="flex items-center">
			<input
				type="checkbox"
				id="official"
				name="official"
				bind:checked={newEvent.official}
				class="h-4 w-4 rounded border-slate-700 bg-slate-800 text-yellow-500 focus:ring-yellow-500"
			/>
			<label for="official" class="ml-2 block text-sm text-slate-300">{m.official_event()}</label>
		</div>
	</div>

	<div class="mt-6 flex justify-end gap-4 border-t border-slate-700 pt-4">
		<button
			type="button"
			class="rounded-md border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
			onclick={onCancel}
		>
			{m.cancel()}
		</button>
		<button
			type="submit"
			class="rounded-md bg-yellow-500 px-4 py-2 font-medium text-black hover:bg-yellow-600"
		>
			{event.id ? m.update_event() : m.create_event()}
		</button>
	</div>
</form>
