<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import { m } from '$lib/paraglide/messages';
	import IconParkSolidEdit from '~icons/icon-park-solid/edit';
	import IconParkSolidDelete from '~icons/icon-park-solid/delete';
	import TypcnArrowUnsorted from '~icons/typcn/arrow-unsorted';
	import TypcnArrowSortedDown from '~icons/typcn/arrow-sorted-down';
	import TypcnArrowSortedUp from '~icons/typcn/arrow-sorted-up';
	import Modal from '$lib/components/Modal.svelte';
	import ContentActionLink from '$lib/components/ContentActionLink.svelte';
	import type { DiscordServer } from '$lib/server/db/schemas/community';
	import DiscordEdit from './DiscordEdit.svelte';

	let { data }: { data: PageData } = $props();
	let { discordServers } = $derived(data);
	let { action, id } = $derived(data);

	let selectedServer: DiscordServer | null = $state(null);
	let searchQuery = $state('');
	let sortBy: 'title-asc' | 'title-desc' | 'date-asc' | 'date-desc' = $state('title-asc');
	let isAddingNew = $state(false);
	let isEditing = $state(false);
	let showHistoryModal = $state(false);
	let showDeleteModal = $state(false);
	let isDeleting = $state(false);

	let filteredServers = $derived(
		discordServers
			.filter((server) => {
				const searchLower = searchQuery.toLowerCase();
				return (
					server.title.toLowerCase().includes(searchLower) ||
					server.description.toLowerCase().includes(searchLower) ||
					(server.additionalLinkText?.toLowerCase().includes(searchLower) ?? false)
				);
			})
			.toSorted((a, b) => {
				if (sortBy === 'title-asc') {
					return a.title.localeCompare(b.title);
				} else if (sortBy === 'title-desc') {
					return b.title.localeCompare(a.title);
				} else if (sortBy === 'date-asc') {
					return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
				} else if (sortBy === 'date-desc') {
					return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
				}
				return 0;
			})
	);

	// Handle URL parameters
	$effect(() => {
		if (action === 'create') {
			handleAddServer();
		} else if (action === 'edit' && id) {
			const serverToEdit = discordServers.find((s) => s.id === id);
			if (serverToEdit) {
				handleEditServer(serverToEdit);
			}
		}
	});

	function handleAddServer() {
		isAddingNew = true;
		isEditing = false;
		selectedServer = null;
	}

	function handleEditServer(server: DiscordServer) {
		selectedServer = server;
		isEditing = true;
		isAddingNew = false;
	}

	function handleCancel() {
		isAddingNew = false;
		isEditing = false;
		selectedServer = null;
		goto('/admin/community', { replaceState: true });
	}

	function handleSuccess() {
		isAddingNew = false;
		isEditing = false;
		selectedServer = null;
		goto('/admin/community', { invalidateAll: true });
	}

	function handleDeleteSubmit() {
		return async ({ update }: { update: () => Promise<void> }) => {
			await update();
			closeDeleteModal();
			goto('/admin/community', { invalidateAll: true });
		};
	}

	async function handleDeleteClick(server: DiscordServer) {
		selectedServer = server;
		showDeleteModal = true;
	}

	function closeDeleteModal() {
		showDeleteModal = false;
		selectedServer = null;
	}

	function closeHistoryModal() {
		showHistoryModal = false;
		selectedServer = null;
	}
</script>

<main class="mx-auto max-w-screen-lg px-4">
	<div class="mb-6 flex items-center justify-between">
		<div class="flex items-center gap-4">
			<h1 class="text-2xl font-bold">{m.community()}</h1>
			<ContentActionLink href="/community" type="view" />
		</div>
		<button
			class="rounded-md bg-yellow-500 px-4 py-2 font-medium text-black hover:bg-yellow-600"
			onclick={handleAddServer}
		>
			{m.create()}
		</button>
	</div>

	{#if isAddingNew || isEditing}
		<Modal show={true} title={isAddingNew ? m.create() : m.edit()} onClose={handleCancel}>
			<div class="w-full max-w-2xl">
				<DiscordEdit
					server={selectedServer || {}}
					onCancel={handleCancel}
					onSuccess={handleSuccess}
				/>
			</div>
		</Modal>
	{/if}

	{#if showDeleteModal && selectedServer}
		<Modal show={true} title={m.delete()} onClose={closeDeleteModal}>
			<div class="w-full max-w-md">
				<p class="mb-4 text-gray-300">{m.delete()}</p>
				<form method="POST" action="?/delete" use:enhance={handleDeleteSubmit}>
					<input type="hidden" name="id" value={selectedServer.id} />
					<div class="flex justify-end gap-2">
						<button
							type="button"
							onclick={closeDeleteModal}
							class="rounded-md bg-gray-700 px-4 py-2 font-medium text-white hover:bg-gray-600"
						>
							{m.cancel()}
						</button>
						<button
							type="submit"
							class="rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-500"
						>
							{m.delete()}
						</button>
					</div>
				</form>
			</div>
		</Modal>
	{/if}

	<div class="mb-4">
		<input
			type="text"
			bind:value={searchQuery}
			placeholder={m.search()}
			class="w-full rounded-md border border-slate-700 bg-slate-800 p-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
		/>
	</div>

	<div
		class="overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb:hover]:bg-slate-500 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-800"
	>
		<table class="w-full table-auto border-collapse border-y-2 border-gray-500 bg-gray-800">
			<thead>
				<tr class="border-b-2 border-gray-500 text-left text-sm text-gray-400">
					<th class="px-4 py-1">
						<button
							class="flex items-center gap-1 text-left"
							class:text-white={sortBy === 'title-asc' || sortBy === 'title-desc'}
							onclick={() => {
								sortBy = sortBy === 'title-asc' ? 'title-desc' : 'title-asc';
							}}
						>
							{m.name()}
							{#if sortBy === 'title-asc'}
								<TypcnArrowSortedUp class="inline-block" />
							{:else if sortBy === 'title-desc'}
								<TypcnArrowSortedDown class="inline-block" />
							{:else}
								<TypcnArrowUnsorted class="inline-block" />
							{/if}
						</button>
					</th>
					<th class="px-4 py-1">{m.description()}</th>
					<th class="px-4 py-1">{m.url()}</th>
					<th class="px-4 py-1">
						<button
							class="flex items-center gap-1 text-left"
							class:text-white={sortBy === 'date-asc' || sortBy === 'date-desc'}
							onclick={() => {
								sortBy = sortBy === 'date-asc' ? 'date-desc' : 'date-asc';
							}}
						>
							{m.created_at()}
							{#if sortBy === 'date-asc'}
								<TypcnArrowSortedUp class="inline-block" />
							{:else if sortBy === 'date-desc'}
								<TypcnArrowSortedDown class="inline-block" />
							{:else}
								<TypcnArrowUnsorted class="inline-block" />
							{/if}
						</button>
					</th>
					<th class="sticky right-0 z-10 h-12 bg-gray-800 px-4 py-1">{m.actions()}</th>
				</tr>
			</thead>
			<tbody>
				{#each filteredServers as server}
					<tr class="border-b border-gray-700 hover:bg-gray-700/50">
						<td class="min-w-max overflow-hidden px-4 py-1">
							<div class="flex items-center gap-3">
								<img src={server.icon} alt={server.title} class="h-10 w-10 rounded-full" />
								<div>
									<div class="font-semibold text-white">{server.title}</div>
								</div>
							</div>
						</td>
						<td class="min-w-max overflow-hidden px-4 py-1 text-gray-300">{server.description}</td>
						<td class="min-w-max overflow-hidden px-4 py-1">
							<a
								href={server.url}
								target="_blank"
								rel="noopener noreferrer"
								class="text-blue-400 hover:text-blue-300"
							>
								{m.url()}
							</a>
							{#if server.additionalLinkUrl}
								<div class="mt-2">
									<a
										href={server.additionalLinkUrl}
										target="_blank"
										rel="noopener noreferrer"
										class="text-blue-400 hover:text-blue-300"
									>
										{server.additionalLinkText || m.name()}
									</a>
								</div>
							{/if}
						</td>
						<td class="min-w-max overflow-hidden px-4 py-1 text-gray-300">
							{new Date(server.createdAt).toLocaleDateString()}
						</td>
						<td class="sticky right-0 z-10 h-12 min-w-max overflow-hidden bg-gray-800">
							<div class="flex h-full items-center gap-2 border-l border-gray-700 px-4 py-1">
								<button
									class="flex items-center gap-1 text-yellow-500 hover:text-yellow-400"
									onclick={() => handleEditServer(server)}
									title={m.edit()}
								>
									<IconParkSolidEdit class="h-4 w-4" />
								</button>
								<button
									class="flex items-center gap-1 text-red-500 hover:text-red-400"
									onclick={() => handleDeleteClick(server)}
									title={m.delete()}
								>
									<IconParkSolidDelete class="h-4 w-4" />
								</button>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</main>
