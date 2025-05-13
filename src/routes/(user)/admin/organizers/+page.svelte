<!-- src/routes/(user)/admin/organizers/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import OrganizerEdit from './OrganizerEdit.svelte';
	import EditHistory from '../events/EditHistory.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { m } from '$lib/paraglide/messages';
	import IconParkSolidEdit from '~icons/icon-park-solid/edit';
	import IconParkSolidDelete from '~icons/icon-park-solid/delete';
	import IconParkSolidHistory from '~icons/icon-park-solid/history-query';
	import TypcnArrowUnsorted from '~icons/typcn/arrow-unsorted';
	import TypcnArrowSortedDown from '~icons/typcn/arrow-sorted-down';
	import TypcnArrowSortedUp from '~icons/typcn/arrow-sorted-up';
	import type { Organizer } from '$lib/server/db/schemas/game/organizer';
	import type { ActionResult } from '@sveltejs/kit';

	let { data }: { data: PageData } = $props();
	let { organizers, action, id } = $derived(data);

	let selectedOrganizer: Organizer | null = $state(null);
	let searchQuery = $state('');
	let sortBy: 'name-asc' | 'name-desc' | 'date-asc' | 'date-desc' = $state('name-asc');
	let isAddingNew = $state(false);
	let isEditing = $state(false);
	let showHistoryModal = $state(false);
	let showDeleteModal = $state(false);
	let deleteDependencies: {
		events: { count: number; events: string };
		users: { count: number; users: string };
	} | null = $state(null);
	let isDeleting = $state(false);

	let filteredOrganizers = $derived(
		organizers
			.filter((organizer) => {
				const searchLower = searchQuery.toLowerCase();
				return (
					organizer.name.toLowerCase().includes(searchLower) ||
					organizer.slug.toLowerCase().includes(searchLower) ||
					organizer.description?.toLowerCase().includes(searchLower)
				);
			})
			.toSorted((a, b) => {
				if (sortBy === 'name-asc') {
					return a.name.localeCompare(b.name);
				} else if (sortBy === 'name-desc') {
					return b.name.localeCompare(a.name);
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
			handleAddOrganizer();
		} else if (action === 'edit' && id) {
			const organizerToEdit = organizers.find((o) => o.id === id);
			if (organizerToEdit) {
				handleEditOrganizer(organizerToEdit);
			}
		}
	});

	function handleAddOrganizer() {
		isAddingNew = true;
		isEditing = false;
		selectedOrganizer = null;
	}

	function handleEditOrganizer(organizer: Organizer) {
		selectedOrganizer = organizer;
		isEditing = true;
		isAddingNew = false;
	}

	function handleCancel() {
		isAddingNew = false;
		isEditing = false;
		selectedOrganizer = null;
		goto('/admin/organizers', { replaceState: true });
	}

	function handleSuccess() {
		isAddingNew = false;
		isEditing = false;
		selectedOrganizer = null;
		goto('/admin/organizers', { invalidateAll: true });
	}

	function handleDeleteSubmit() {
		return async ({ update }: { update: () => Promise<void> }) => {
			await update();
			closeDeleteModal();
			goto('/admin/organizers', { invalidateAll: true });
		};
	}

	function handleCheckDependenciesSubmit() {
		return async ({ result }: { result: ActionResult }) => {
			isDeleting = true;
			if (result.type === 'success') {
				deleteDependencies = result.data?.dependencies ?? null;
				showDeleteModal = true;
			} else if (result.type === 'failure') {
				alert(result.data?.error || 'Failed to check dependencies');
			} else if (result.type === 'error') {
				alert(result.error?.message || 'An error occurred');
			}
			isDeleting = false;
		};
	}

	$inspect('deleteDependencies', deleteDependencies);

	async function handleDeleteClick(organizer: Organizer) {
		selectedOrganizer = organizer;
		isDeleting = true;

		try {
			const formData = new FormData();
			formData.append('id', organizer.id);

			const response = await fetch('?/checkDependencies', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (result.success) {
				deleteDependencies = result.dependencies;
				showDeleteModal = true;
			} else {
				alert(result.error || 'Failed to check dependencies');
			}
		} catch (e) {
			console.error('Failed to check dependencies:', e);
			alert('Failed to check dependencies');
		} finally {
			isDeleting = false;
		}
	}

	function closeDeleteModal() {
		showDeleteModal = false;
		selectedOrganizer = null;
		deleteDependencies = null;
	}

	function closeHistoryModal() {
		showHistoryModal = false;
		selectedOrganizer = null;
	}
</script>

<main class="mx-auto max-w-screen-lg px-4">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-bold">{m.organizers()}</h1>
		<button
			class="rounded-md bg-yellow-500 px-4 py-2 font-medium text-black hover:bg-yellow-600"
			onclick={() => {
				selectedOrganizer = null;
				isAddingNew = true;
				isEditing = false;
			}}
		>
			{m.create_organizer()}
		</button>
	</div>

	{#if isAddingNew || isEditing}
		<Modal
			show={true}
			title={isAddingNew ? m.add_new() : m.edit()}
			onClose={handleCancel}
			dismissible={false}
		>
			<OrganizerEdit
				organizer={selectedOrganizer ?? {}}
				onCancel={handleCancel}
				onSuccess={handleSuccess}
			/>
		</Modal>
	{/if}

	{#if showHistoryModal}
		<Modal show={true} title={m.history()} onClose={closeHistoryModal}>
			{#if selectedOrganizer}
				<EditHistory recordId={selectedOrganizer.id} />
			{/if}
		</Modal>
	{/if}

	{#if showDeleteModal && selectedOrganizer && deleteDependencies}
		<Modal show={true} title={m.delete_organizer()} onClose={closeDeleteModal}>
			<div class="space-y-4">
				<p class="text-gray-300">
					{m.delete_organizer_confirmation({ name: selectedOrganizer.name })}
				</p>

				{#if deleteDependencies.events.count > 0 || deleteDependencies.users.count > 0}
					<div class="rounded-md bg-yellow-900/50 p-4 text-yellow-200">
						<h3 class="mb-2 font-semibold">{m.warning()}</h3>
						<p class="mb-2">{m.delete_organizer_warning()}</p>
						<p class="mb-4 text-sm text-yellow-100">
							{m.delete_organizer_manual_warning()}
						</p>

						{#if deleteDependencies.events.count > 0}
							<div class="mb-2">
								<p class="font-medium">
									{m.events_affected({ count: deleteDependencies.events.count })}
								</p>
								{#if deleteDependencies.events.events}
									<p class="text-sm text-yellow-100">
										{deleteDependencies.events.events.split(',').join(', ')}
									</p>
								{/if}
							</div>
						{/if}

						{#if deleteDependencies.users.count > 0}
							<div>
								<p class="font-medium">
									{m.users_affected({ count: deleteDependencies.users.count })}
								</p>
								{#if deleteDependencies.users.users}
									<p class="text-sm text-yellow-100">
										{deleteDependencies.users.users.split(',').join(', ')}
									</p>
								{/if}
							</div>
						{/if}
					</div>
				{/if}

				<div class="flex justify-end gap-2">
					<button
						class="rounded-md bg-gray-700 px-4 py-2 font-medium text-white hover:bg-gray-600"
						onclick={closeDeleteModal}
					>
						{m.cancel()}
					</button>
					<form method="POST" action="?/delete" use:enhance={handleDeleteSubmit} class="inline">
						<input type="hidden" name="id" value={selectedOrganizer.id} />
						<input type="hidden" name="confirmed" value="true" />
						<button
							type="submit"
							class="rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-500"
							disabled={isDeleting}
						>
							{isDeleting ? m.deleting() : m.delete()}
						</button>
					</form>
				</div>
			</div>
		</Modal>
	{/if}

	<div class="mb-4">
		<input
			type="text"
			bind:value={searchQuery}
			placeholder={m.search()}
			class="w-full rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
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
							class:text-white={sortBy === 'name-asc' || sortBy === 'name-desc'}
							onclick={() => (sortBy = sortBy === 'name-asc' ? 'name-desc' : 'name-asc')}
						>
							{m.name()}
							{#if sortBy === 'name-asc'}
								<TypcnArrowSortedUp class="inline-block" />
							{:else if sortBy === 'name-desc'}
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
							onclick={() => (sortBy = sortBy === 'date-asc' ? 'date-desc' : 'date-asc')}
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
				{#each filteredOrganizers as organizer}
					<tr class="border-b-1 border-gray-500 bg-gray-800 px-4 py-2 shadow-2xl">
						<td class="min-w-max overflow-hidden px-4 py-1">
							<div class="flex min-w-max items-center">
								{#if organizer.logoURL}
									<img
										class="mr-3 h-10 w-10 flex-shrink-0 rounded-full"
										src={organizer.logoURL}
										alt={organizer.name}
									/>
								{/if}
								<a
									class="flex min-w-max flex-shrink-0 flex-col"
									href={`/organizers/${organizer.slug}`}
								>
									<div class="flex-shrink-0 whitespace-nowrap text-white">{organizer.name}</div>
									<div class="flex-shrink-0 text-sm text-gray-400">{organizer.slug}</div>
								</a>
							</div>
						</td>
						<td class="min-w-max overflow-hidden px-4 py-1 text-gray-300"
							>{organizer.description}</td
						>
						<td class="min-w-max overflow-hidden px-4 py-1 text-gray-300">
							<a
								href={organizer.url}
								target="_blank"
								rel="noopener noreferrer"
								class="text-blue-400 hover:text-blue-300"
							>
								{organizer.url}
							</a>
						</td>
						<td class="min-w-max overflow-hidden px-4 py-1 text-gray-300">
							{new Date(organizer.createdAt).toLocaleDateString()}
						</td>
						<td class="sticky right-0 z-10 h-12 min-w-max overflow-hidden bg-gray-800">
							<div class="flex h-full items-center gap-2 border-l border-gray-700 px-4 py-1">
								<button
									class="flex items-center gap-1 text-yellow-500 hover:text-yellow-400"
									onclick={() => {
										selectedOrganizer = organizer;
										isAddingNew = false;
										isEditing = true;
									}}
									title={m.edit()}
								>
									<IconParkSolidEdit class="h-4 w-4" />
								</button>
								<button
									class="text-gray-400 hover:text-gray-300"
									onclick={() => {
										selectedOrganizer = organizer;
										showHistoryModal = true;
									}}
									title={m.history()}
								>
									<IconParkSolidHistory class="h-4 w-4" />
								</button>
								<form
									method="POST"
									action="?/checkDependencies"
									use:enhance={() => {
										selectedOrganizer = organizer;
										isDeleting = true;
										return handleCheckDependenciesSubmit();
									}}
									class="inline"
								>
									<input type="hidden" name="id" value={organizer.id} />
									<button
										type="submit"
										class="flex items-center gap-1 text-red-500 hover:text-red-400"
										title={m.delete()}
										disabled={isDeleting}
									>
										<IconParkSolidDelete class="h-4 w-4" />
									</button>
								</form>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</main>
