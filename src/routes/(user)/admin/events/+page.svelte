<!-- src/routes/(user)/admin/events/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import EventEdit from './EventEdit.svelte';
	import EditHistory from './EditHistory.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { m } from '$lib/paraglide/messages';
	import IconParkSolidEdit from '~icons/icon-park-solid/edit';
	import IconParkSolidDelete from '~icons/icon-park-solid/delete';
	import IconParkSolidHistory from '~icons/icon-park-solid/history-query';
	import TypcnArrowUnsorted from '~icons/typcn/arrow-unsorted';
	import TypcnArrowSortedDown from '~icons/typcn/arrow-sorted-down';
	import TypcnArrowSortedUp from '~icons/typcn/arrow-sorted-up';
	import type { EventWithOrganizers } from '$lib/server/data/events';
	import OrganizerChip from '$lib/components/OrganizerChip.svelte';
	import ContentActionLink from '$lib/components/ContentActionLink.svelte';

	let { data }: { data: PageData } = $props();
	let { events, action, id, organizers, eventOrganizers } = $derived(data);

	$inspect('[admin/events] data', data);

	let selectedEvent: EventWithOrganizers | null = $state(null);
	let searchQuery = $state('');
	let sortBy:
		| 'name-asc'
		| 'name-desc'
		| 'date-asc'
		| 'date-desc'
		| 'status-asc'
		| 'status-desc'
		| 'official-asc'
		| 'official-desc'
		| 'capacity-asc'
		| 'capacity-desc' = $state('date-desc');
	let isAddingNew = $state(false);
	let isEditing = $state(false);
	let showHistoryModal = $state(false);

	let filteredEvents = $derived(
		events
			.filter((event) => {
				const searchLower = searchQuery.toLowerCase();
				return (
					event.name.toLowerCase().includes(searchLower) ||
					event.slug.toLowerCase().includes(searchLower) ||
					event.server.toLowerCase().includes(searchLower)
				);
			})
			.toSorted((a, b) => {
				if (sortBy === 'name-asc') {
					return a.name.localeCompare(b.name);
				} else if (sortBy === 'name-desc') {
					return b.name.localeCompare(a.name);
				} else if (sortBy === 'date-asc') {
					return new Date(a.date).getTime() - new Date(b.date).getTime();
				} else if (sortBy === 'date-desc') {
					return new Date(b.date).getTime() - new Date(a.date).getTime();
				} else if (sortBy === 'status-asc') {
					return a.status.localeCompare(b.status);
				} else if (sortBy === 'status-desc') {
					return b.status.localeCompare(a.status);
				} else if (sortBy === 'official-asc') {
					return (a.official ? 1 : 0) - (b.official ? 1 : 0);
				} else if (sortBy === 'official-desc') {
					return (b.official ? 1 : 0) - (a.official ? 1 : 0);
				} else if (sortBy === 'capacity-asc') {
					return (a.capacity ?? 0) - (b.capacity ?? 0);
				} else if (sortBy === 'capacity-desc') {
					return (b.capacity ?? 0) - (a.capacity ?? 0);
				}
				return 0;
			})
	);

	// Handle URL parameters
	$effect(() => {
		if (action === 'create') {
			handleAddEvent();
		} else if (action === 'edit' && id) {
			const eventToEdit = events.find((e) => e.id === id);
			if (eventToEdit) {
				handleEditEvent({
					...eventToEdit,
					createdAt: new Date(),
					updatedAt: new Date(),
					organizers: (eventToEdit.organizers || []).map((org) => ({
						...org,
						description: org.description ?? null,
						url: org.url ?? null,
						type: org.type ?? null,
						createdAt: new Date(),
						updatedAt: new Date()
					}))
				});
			}
		}
	});

	function handleAddEvent() {
		isAddingNew = true;
		isEditing = false;
		selectedEvent = null;
	}

	function handleEditEvent(event: EventWithOrganizers) {
		selectedEvent = event;
		isEditing = true;
		isAddingNew = false;
	}

	function handleCancel() {
		isAddingNew = false;
		isEditing = false;
		selectedEvent = null;
		goto('/admin/events', { replaceState: true });
	}

	function handleSuccess() {
		isAddingNew = false;
		isEditing = false;
		selectedEvent = null;
		goto('/admin/events', { invalidateAll: true });
	}

	function handleDelete(event: SubmitEvent) {
		if (!confirm(m.delete_event_confirmation())) {
			event.preventDefault();
		}
	}

	function closeHistoryModal() {
		showHistoryModal = false;
		selectedEvent = null;
	}
</script>

<main class="mx-auto max-w-screen-lg px-4">
	<div class="mb-6 flex items-center justify-between">
		<div class="flex items-center gap-4">
			<h1 class="text-2xl font-bold">{m.events()}</h1>
			<ContentActionLink href="/events" type="view" />
		</div>
		<button
			class="rounded-md bg-yellow-500 px-4 py-2 font-medium text-black hover:bg-yellow-600"
			onclick={() => {
				selectedEvent = null;
				isAddingNew = true;
				isEditing = false;
			}}
		>
			{m.create_event()}
		</button>
	</div>

	{#if isAddingNew || isEditing}
		<Modal
			show={true}
			title={isAddingNew ? m.add_new() : m.edit()}
			onClose={handleCancel}
			dismissible={false}
		>
			<EventEdit
				event={selectedEvent ?? {}}
				{organizers}
				eventOrganizers={(() => {
					if (!selectedEvent) return [];
					const event = selectedEvent as EventWithOrganizers;
					return eventOrganizers.filter((eo) => eo.eventId === event.id);
				})()}
				teams={data.teams}
				players={data.players}
				teamPlayers={data.teamPlayers}
				onCancel={handleCancel}
				onSuccess={handleSuccess}
			/>
		</Modal>
	{/if}

	{#if showHistoryModal}
		<Modal show={true} title={m.history()} onClose={closeHistoryModal}>
			{#if selectedEvent}
				<EditHistory recordId={selectedEvent.id} />
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
					<th class="px-4 py-1">{m.server()}</th>
					<th class="px-4 py-1">
						<button
							class="flex items-center gap-1 text-left"
							class:text-white={sortBy === 'capacity-asc' || sortBy === 'capacity-desc'}
							onclick={() =>
								(sortBy = sortBy === 'capacity-asc' ? 'capacity-desc' : 'capacity-asc')}
						>
							{m.capacity()}
							{#if sortBy === 'capacity-asc'}
								<TypcnArrowSortedUp class="inline-block" />
							{:else if sortBy === 'capacity-desc'}
								<TypcnArrowSortedDown class="inline-block" />
							{:else}
								<TypcnArrowUnsorted class="inline-block" />
							{/if}
						</button>
					</th>
					<th class="px-4 py-1">{m.format()}</th>
					<th class="px-4 py-1">{m.region()}</th>
					<th class="px-4 py-1">
						<button
							class="flex items-center gap-1 text-left"
							class:text-white={sortBy === 'status-asc' || sortBy === 'status-desc'}
							onclick={() => (sortBy = sortBy === 'status-asc' ? 'status-desc' : 'status-asc')}
						>
							{m.status()}
							{#if sortBy === 'status-asc'}
								<TypcnArrowSortedUp class="inline-block" />
							{:else if sortBy === 'status-desc'}
								<TypcnArrowSortedDown class="inline-block" />
							{:else}
								<TypcnArrowUnsorted class="inline-block" />
							{/if}
						</button>
					</th>
					<th class="px-4 py-1">
						<button
							class="flex items-center gap-1 text-left"
							class:text-white={sortBy === 'official-asc' || sortBy === 'official-desc'}
							onclick={() =>
								(sortBy = sortBy === 'official-asc' ? 'official-desc' : 'official-asc')}
						>
							{m.official()}
							{#if sortBy === 'official-asc'}
								<TypcnArrowSortedUp class="inline-block" />
							{:else if sortBy === 'official-desc'}
								<TypcnArrowSortedDown class="inline-block" />
							{:else}
								<TypcnArrowUnsorted class="inline-block" />
							{/if}
						</button>
					</th>
					<th class="px-4 py-1">
						<button
							class="flex items-center gap-1 text-left"
							class:text-white={sortBy === 'date-asc' || sortBy === 'date-desc'}
							onclick={() => (sortBy = sortBy === 'date-asc' ? 'date-desc' : 'date-asc')}
						>
							{m.date()}
							{#if sortBy === 'date-asc'}
								<TypcnArrowSortedUp class="inline-block" />
							{:else if sortBy === 'date-desc'}
								<TypcnArrowSortedDown class="inline-block" />
							{:else}
								<TypcnArrowUnsorted class="inline-block" />
							{/if}
						</button>
					</th>
					<th class="px-4 py-1">Organizers</th>
					<th class="px-4 py-1">{m.links()}</th>
					<th class="sticky right-0 z-10 h-12 bg-gray-800 px-4 py-1">{m.actions()}</th>
				</tr>
			</thead>
			<tbody>
				{#each filteredEvents as event}
					<tr class="border-b-1 border-gray-500 bg-gray-800 px-4 py-2 shadow-2xl">
						<td class="min-w-max overflow-hidden px-4 py-1">
							<div class="flex min-w-max items-center">
								{#if event.imageURL}
									<img
										class="mr-3 h-10 w-16 flex-shrink-0 rounded-md object-cover"
										src={event.imageURL}
										alt={event.name}
									/>
								{/if}
								<div class="flex min-w-max flex-shrink-0 flex-col">
									<div class="flex-shrink-0 whitespace-nowrap text-white">{event.name}</div>
									<a
										href="/events/{event.slug}"
										class="flex-shrink-0 text-sm whitespace-nowrap text-gray-400 transition-colors duration-200 hover:text-yellow-400"
									>
										{event.slug}
									</a>
								</div>
							</div>
						</td>
						<td class="min-w-max px-4 py-1 whitespace-nowrap text-gray-300">{event.server}</td>
						<td class="min-w-max px-4 py-1 whitespace-nowrap text-gray-300"
							>{event.capacity || '-'}</td
						>
						<td class="min-w-max px-4 py-1 whitespace-nowrap text-gray-300">{event.format}</td>
						<td class="min-w-max px-4 py-1 whitespace-nowrap text-gray-300">{event.region}</td>
						<td class="min-w-max px-4 py-1 whitespace-nowrap">
							<span
								class="inline-flex rounded-full px-2 text-xs leading-5 font-semibold {event.status ===
								'live'
									? 'bg-green-900/50 text-green-200'
									: event.status === 'upcoming'
										? 'bg-blue-900/50 text-blue-200'
										: event.status === 'cancelled'
											? 'bg-red-900/50 text-red-200'
											: event.status === 'postponed'
												? 'bg-yellow-900/50 text-yellow-200'
												: 'bg-gray-900/50 text-gray-200'}"
							>
								{event.status}
							</span>
						</td>
						<td class="min-w-max px-4 py-1 whitespace-nowrap">
							<span
								class="inline-flex rounded-full px-2 text-xs leading-5 font-semibold {event.official
									? 'bg-yellow-900/50 text-yellow-200'
									: 'bg-gray-900/50 text-gray-200'}"
							>
								{event.official ? m.yes() : m.no()}
							</span>
						</td>
						<td class="min-w-max px-4 py-1 whitespace-nowrap text-gray-300">
							{#if event.date.includes('/')}
								{(() => {
									const [start, end] = event.date.split('/');
									return `${new Date(start).toLocaleDateString()} - ${new Date(end).toLocaleDateString()}`;
								})()}
							{:else}
								{new Date(event.date).toLocaleDateString()}
							{/if}
						</td>
						<td class="min-w-max px-4 py-1">
							<div class="flex min-w-max flex-wrap gap-2">
								{#if event.organizers.length}
									{#each event.organizers as organizer}
										<OrganizerChip {organizer} />
									{/each}
								{:else}
									<span class="text-sm whitespace-nowrap text-slate-500">No organizers</span>
								{/if}
							</div>
						</td>
						<td class="min-w-max px-4 py-1">
							<div class="flex min-w-max flex-wrap gap-2">
								{#if event.websites?.length}
									{#each event.websites as website}
										<a
											href={website.url}
											target="_blank"
											rel="noopener noreferrer"
											class="inline-flex items-center gap-1 rounded-full bg-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-600"
											title={website.label || website.url}
										>
											{website.label || new URL(website.url).hostname}
										</a>
									{/each}
								{:else}
									<span class="text-sm whitespace-nowrap text-slate-500">{m.no_data()}</span>
								{/if}
							</div>
						</td>
						<td class="sticky right-0 z-10 h-12 min-w-max bg-gray-800 whitespace-nowrap">
							<div class="flex h-full items-center gap-2 border-l border-gray-700 px-4 py-1">
								<button
									class="flex items-center gap-1 text-yellow-500 hover:text-yellow-400"
									onclick={() => {
										selectedEvent = {
											...event,
											createdAt: new Date(),
											updatedAt: new Date(),
											organizers: (event.organizers || []).map((org) => ({
												...org,
												description: org.description ?? null,
												url: org.url ?? null,
												type: org.type ?? null,
												createdAt: new Date(),
												updatedAt: new Date()
											}))
										};
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
										selectedEvent = {
											...event,
											createdAt: new Date(),
											updatedAt: new Date(),
											organizers: (event.organizers || []).map((org) => ({
												...org,
												description: org.description ?? null,
												url: org.url ?? null,
												type: org.type ?? null,
												createdAt: new Date(),
												updatedAt: new Date()
											}))
										};
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
									<input type="hidden" name="id" value={event.id} />
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
