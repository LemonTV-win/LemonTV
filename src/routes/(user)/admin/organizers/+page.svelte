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

	let { data }: { data: PageData } = $props();
	let { organizers, action, id } = $derived(data);

	let selectedOrganizer: Organizer | null = $state(null);
	let searchQuery = $state('');
	let sortBy: 'name-asc' | 'name-desc' | 'date-asc' | 'date-desc' = $state('name-asc');
	let isAddingNew = $state(false);
	let isEditing = $state(false);
	let showHistoryModal = $state(false);

	let filteredOrganizers = $derived(
		organizers
			.filter((organizer) => {
				const searchLower = searchQuery.toLowerCase();
				return (
					organizer.name.toLowerCase().includes(searchLower) ||
					organizer.slug.toLowerCase().includes(searchLower) ||
					organizer.description.toLowerCase().includes(searchLower)
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

	function handleDelete(event: SubmitEvent) {
		if (!confirm(m.delete_organizer_confirmation())) {
			event.preventDefault();
		}
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
						<td class="px-4 py-1">
							<div class="flex items-center">
								{#if organizer.logo}
									<img
										class="mr-3 h-10 w-10 rounded-full"
										src={organizer.logo}
										alt={organizer.name}
									/>
								{/if}
								<div>
									<div class="text-white">{organizer.name}</div>
									<div class="text-sm text-gray-400">{organizer.slug}</div>
								</div>
							</div>
						</td>
						<td class="px-4 py-1 text-gray-300">{organizer.description}</td>
						<td class="px-4 py-1 text-gray-300">
							<a
								href={organizer.url}
								target="_blank"
								rel="noopener noreferrer"
								class="text-blue-400 hover:text-blue-300"
							>
								{organizer.url}
							</a>
						</td>
						<td class="px-4 py-1 text-gray-300">
							{new Date(organizer.createdAt).toLocaleDateString()}
						</td>
						<td class="sticky right-0 z-10 h-12 bg-gray-800">
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
									action="?/delete"
									use:enhance
									class="inline"
									onsubmit={handleDelete}
								>
									<input type="hidden" name="id" value={organizer.id} />
									<button
										type="submit"
										class="flex items-center gap-1 text-red-500 hover:text-red-400"
										title={m.delete()}
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
