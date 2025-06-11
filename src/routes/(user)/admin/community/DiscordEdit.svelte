<!-- src/routes/(user)/admin/community/DiscordEdit.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { DiscordServer } from '$lib/server/db/schemas/community';
	import { m } from '$lib/paraglide/messages';
	import ImageUpload from '$lib/components/ImageUpload.svelte';

	let {
		server,
		onCancel,
		onSuccess: onsuccess
	}: {
		server: Partial<DiscordServer>;
		onCancel: () => void;
		onSuccess: () => void;
	} = $props();

	let newServer = $state({
		id: server.id || '',
		title: server.title || '',
		url: server.url || '',
		icon: server.icon || '',
		description: server.description || '',
		additionalLinkText: server.additionalLinkText || '',
		additionalLinkUrl: server.additionalLinkUrl || ''
	});
	let errorMessage = $state('');
	let successMessage = $state('');
</script>

<form
	method="POST"
	action={server.id ? '?/update' : '?/create'}
	use:enhance={({ formData }) => {
		console.log('enhance', [...formData.entries()]);
		return async ({ result }) => {
			if (result.type === 'success') {
				onsuccess();
				onCancel();
			} else if (result.type === 'failure') {
				errorMessage =
					typeof result.data?.error === 'string' ? result.data.error : 'Failed to save server';
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

	<input type="hidden" name="id" value={newServer.id} />

	<div class="mb-4">
		<label class="block text-sm font-medium text-slate-300" for="title">{m.name()}</label>
		<input
			type="text"
			id="title"
			name="title"
			bind:value={newServer.title}
			required
			class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
		/>
	</div>

	<div class="mb-4">
		<label class="block text-sm font-medium text-slate-300" for="url"
			>{m.discord_invite_url()}</label
		>
		<input
			type="url"
			id="url"
			name="url"
			bind:value={newServer.url}
			required
			class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
		/>
	</div>

	<div class="mb-4">
		<label class="block text-sm font-medium text-slate-300" for="icon">{m.icon_url()}</label>
		<ImageUpload bind:value={newServer.icon} prefix="community" />
		<input type="hidden" name="icon" value={newServer.icon} />
	</div>

	<div class="mb-4">
		<label class="block text-sm font-medium text-slate-300" for="description"
			>{m.description()}</label
		>
		<textarea
			id="description"
			name="description"
			bind:value={newServer.description}
			required
			rows="4"
			class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
		></textarea>
	</div>

	<div class="mb-4">
		<label class="block text-sm font-medium text-slate-300" for="additionalLinkText"
			>{m.additional_link_text()}</label
		>
		<input
			type="text"
			id="additionalLinkText"
			name="additionalLinkText"
			bind:value={newServer.additionalLinkText}
			class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
		/>
	</div>

	<div class="mb-4">
		<label class="block text-sm font-medium text-slate-300" for="additionalLinkUrl"
			>{m.additional_link_url()}</label
		>
		<input
			type="url"
			id="additionalLinkUrl"
			name="additionalLinkUrl"
			bind:value={newServer.additionalLinkUrl}
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
			{server.id ? m.save() : m.create()}
		</button>
	</div>
</form>
