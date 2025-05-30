<!-- src/routes/(user)/admin/organizers/OrganizerEdit.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Organizer } from '$lib/server/db/schemas/game/organizer';
	import { m } from '$lib/paraglide/messages';
	import ImageUpload from '$lib/components/ImageUpload.svelte';

	let {
		organizer,
		onCancel,
		onSuccess: onsuccess
	}: {
		organizer: Partial<Organizer>;
		onCancel: () => void;
		onSuccess: () => void;
	} = $props();

	let newOrganizer = $state({
		id: organizer.id || '',
		name: organizer.name || '',
		slug: organizer.slug || '',
		logo: organizer.logo || '',
		description: organizer.description || '',
		url: organizer.url || '',
		type: organizer.type || ''
	});
	let errorMessage = $state('');
	let successMessage = $state('');

	const organizerTypes = [
		{ value: 'individual', label: m.individual() },
		{ value: 'organization', label: m.organization() },
		{ value: 'community', label: m.community() },
		{ value: 'tournament_series', label: m.tournament_series() },
		{ value: 'league', label: m.league() }
	];
</script>

<form
	method="POST"
	action={organizer.id ? '?/update' : '?/create'}
	use:enhance={() => {
		return async ({ result }) => {
			if (result.type === 'success') {
				onsuccess();
				onCancel();
			} else if (result.type === 'failure') {
				errorMessage =
					typeof result.data?.error === 'string' ? result.data.error : 'Failed to save organizer';
			} else if (result.type === 'error') {
				errorMessage = result.error?.message || 'An error occurred';
			}
		};
	}}
	class="flex h-full flex-col"
>
	{#if errorMessage}
		<div class="mb-4 rounded-md bg-red-900/50 p-4 text-red-200">{errorMessage}</div>
	{/if}

	{#if successMessage}
		<div class="mb-4 rounded-md bg-green-900/50 p-4 text-green-200">{successMessage}</div>
	{/if}

	<input type="hidden" name="id" value={newOrganizer.id} />

	<div class="mb-4">
		<label class="block text-sm font-medium text-slate-300" for="name">{m.name()}</label>
		<input
			type="text"
			id="name"
			name="name"
			bind:value={newOrganizer.name}
			required
			class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
		/>
	</div>

	<div class="mb-4">
		<label class="block text-sm font-medium text-slate-300" for="slug">{m.slug()}</label>
		<input
			type="text"
			id="slug"
			name="slug"
			bind:value={newOrganizer.slug}
			required
			class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
		/>
	</div>

	<div class="mb-4">
		<label class="block text-sm font-medium text-slate-300" for="type">Type</label>
		<select
			id="type"
			name="type"
			bind:value={newOrganizer.type}
			class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
		>
			<option value="">({m.none()})</option>
			{#each organizerTypes as type}
				<option value={type.value}>{type.label}</option>
			{/each}
		</select>
	</div>

	<div class="mb-4">
		<label class="block text-sm font-medium text-slate-300" for="logo">{m.logo()}</label>
		<ImageUpload bind:value={newOrganizer.logo} prefix="organizers" />
		<input type="hidden" name="logo" value={newOrganizer.logo} />
	</div>

	<div class="mb-4">
		<label class="block text-sm font-medium text-slate-300" for="description"
			>{m.description()}</label
		>
		<textarea
			id="description"
			name="description"
			bind:value={newOrganizer.description}
			required
			rows="4"
			class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
		></textarea>
	</div>

	<div class="mb-4">
		<label class="block text-sm font-medium text-slate-300" for="url">{m.url()}</label>
		<input
			type="url"
			id="url"
			name="url"
			bind:value={newOrganizer.url}
			required
			class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
		/>
	</div>

	<div class="mt-auto flex justify-end gap-4">
		<button
			type="button"
			onclick={onCancel}
			class="rounded-md bg-slate-700 px-4 py-2 font-medium text-white hover:bg-slate-600"
		>
			{m.cancel()}
		</button>
		<button
			type="submit"
			class="rounded-md bg-yellow-500 px-4 py-2 font-medium text-black hover:bg-yellow-600"
		>
			{organizer.id ? m.save() : m.create()}
		</button>
	</div>
</form>
