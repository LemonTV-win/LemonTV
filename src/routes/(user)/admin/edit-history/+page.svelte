<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import IconParkSolidSearch from '~icons/icon-park-solid/search';
	import IconParkSolidClear from '~icons/icon-park-solid/clear';
	import TypcnArrowUnsorted from '~icons/typcn/arrow-unsorted';
	import TypcnArrowSortedDown from '~icons/typcn/arrow-sorted-down';
	import TypcnArrowSortedUp from '~icons/typcn/arrow-sorted-up';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import PageNavigator from '$lib/components/PageNavigator.svelte';

	let { data }: { data: PageData } = $props();

	let tableName = $state(data.filters.tableName || '');
	let recordId = $state(data.filters.recordId || '');
	let fieldName = $state(data.filters.fieldName || '');
	let editedBy = $state(data.filters.editedBy || '');
	let currentPage = $state(data.page);
	let showUserDropdown = $state(false);
	let userSearch = $state('');
	let sortBy:
		| 'tableName-asc'
		| 'tableName-desc'
		| 'recordId-asc'
		| 'recordId-desc'
		| 'fieldName-asc'
		| 'fieldName-desc'
		| 'editedBy-asc'
		| 'editedBy-desc'
		| 'editedAt-asc'
		| 'editedAt-desc' = $state('editedAt-desc');

	let filteredUsers = $derived(
		data.users
			?.filter((user) => user.username.toLowerCase().includes(userSearch.toLowerCase()))
			.slice(0, 5) || []
	);

	function selectUser(username: string) {
		editedBy = username;
		userSearch = username;
		showUserDropdown = false;
	}

	function applyFilters() {
		const params = new SvelteURLSearchParams();
		if (tableName) params.set('tableName', tableName);
		if (recordId) params.set('recordId', recordId);
		if (fieldName) params.set('fieldName', fieldName);
		if (editedBy) params.set('editedBy', editedBy);
		if (currentPage > 1) params.set('page', currentPage.toString());
		goto(`?${params.toString()}`, { replaceState: true });
	}

	function clearFilters() {
		tableName = '';
		recordId = '';
		fieldName = '';
		editedBy = '';
		userSearch = '';
		currentPage = 1;
		goto('', { replaceState: true });
	}

	function formatDate(timestamp: number | Date) {
		if (timestamp instanceof Date) {
			return timestamp.toLocaleString();
		}
		return new Date(timestamp).toLocaleString();
	}

	function formatValue(value: string | null) {
		if (value === null) return '<null>';
		try {
			const parsed = JSON.parse(value);
			return JSON.stringify(parsed, null, 2);
		} catch {
			return value;
		}
	}

	function handlePageChange(page: number) {
		currentPage = page;
		applyFilters();
	}

	let filteredRecords = $derived(
		data.records.toSorted((a, b) => {
			if (sortBy === 'tableName-asc') {
				return a.editHistory.tableName.localeCompare(b.editHistory.tableName);
			} else if (sortBy === 'tableName-desc') {
				return b.editHistory.tableName.localeCompare(a.editHistory.tableName);
			} else if (sortBy === 'recordId-asc') {
				return a.editHistory.recordId.localeCompare(b.editHistory.recordId);
			} else if (sortBy === 'recordId-desc') {
				return b.editHistory.recordId.localeCompare(a.editHistory.recordId);
			} else if (sortBy === 'fieldName-asc') {
				return a.editHistory.fieldName.localeCompare(b.editHistory.fieldName);
			} else if (sortBy === 'fieldName-desc') {
				return b.editHistory.fieldName.localeCompare(a.editHistory.fieldName);
			} else if (sortBy === 'editedBy-asc') {
				return (a.editor?.username ?? '').localeCompare(b.editor?.username ?? '');
			} else if (sortBy === 'editedBy-desc') {
				return (b.editor?.username ?? '').localeCompare(a.editor?.username ?? '');
			} else if (sortBy === 'editedAt-asc') {
				return a.editHistory.editedAt.getTime() - b.editHistory.editedAt.getTime();
			} else if (sortBy === 'editedAt-desc') {
				return b.editHistory.editedAt.getTime() - a.editHistory.editedAt.getTime();
			}
			return 0;
		})
	);
</script>

<svelte:head>
	<title>{m.edit_history()} | {m.admin_panel()} | LemonTV</title>
</svelte:head>

<main class="mx-auto max-w-screen-lg px-4">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-bold">{m.admin_dashboard()}</h1>
		<h2 class="text-xl font-bold">{m.edit_history()}</h2>
	</div>

	<div class="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<div class="relative">
			<input
				type="text"
				bind:value={tableName}
				placeholder={m.table_name()}
				class="w-full rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
			/>
		</div>
		<div class="relative">
			<input
				type="text"
				bind:value={recordId}
				placeholder={m.record_id()}
				class="w-full rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
			/>
		</div>
		<div class="relative">
			<input
				type="text"
				bind:value={fieldName}
				placeholder={m.field_name()}
				class="w-full rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
			/>
		</div>
		<div class="relative">
			<input
				type="text"
				bind:value={userSearch}
				placeholder={m.edited_by()}
				onfocus={() => (showUserDropdown = true)}
				class="w-full rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
			/>
			{#if showUserDropdown && filteredUsers.length > 0}
				<div
					class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-700 bg-slate-800 py-1 shadow-lg"
				>
					{#each filteredUsers as user (user.id)}
						<button
							class="w-full px-4 py-2 text-left text-white hover:bg-slate-700"
							onmousedown={() => selectUser(user.username)}
						>
							{user.username}
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<div class="mb-4 flex justify-end gap-2">
		<button
			class="flex items-center gap-2 rounded-md bg-slate-700 px-4 py-2 font-medium text-white hover:bg-slate-600"
			onclick={clearFilters}
		>
			<IconParkSolidClear class="h-5 w-5" />
			{m.clear_filters()}
		</button>
		<button
			class="flex items-center gap-2 rounded-md bg-yellow-500 px-4 py-2 font-medium text-black hover:bg-yellow-600"
			onclick={applyFilters}
		>
			<IconParkSolidSearch class="h-5 w-5" />
			{m.apply_filters()}
		</button>
	</div>

	<div class="glass-card-container styled-scroll-horizontal overflow-x-auto">
		<table class="glass-table w-full table-auto">
			<thead>
				<tr>
					<th class="px-4 py-1">
						<button
							class="flex items-center gap-1 text-left"
							class:text-white={sortBy === 'tableName-asc' || sortBy === 'tableName-desc'}
							onclick={() =>
								(sortBy = sortBy === 'tableName-asc' ? 'tableName-desc' : 'tableName-asc')}
						>
							{m.table_name()}
							{#if sortBy === 'tableName-asc'}
								<TypcnArrowSortedUp class="inline-block" />
							{:else if sortBy === 'tableName-desc'}
								<TypcnArrowSortedDown class="inline-block" />
							{:else}
								<TypcnArrowUnsorted class="inline-block" />
							{/if}
						</button>
					</th>
					<th class="px-4 py-1">
						<button
							class="flex items-center gap-1 text-left"
							class:text-white={sortBy === 'recordId-asc' || sortBy === 'recordId-desc'}
							onclick={() =>
								(sortBy = sortBy === 'recordId-asc' ? 'recordId-desc' : 'recordId-asc')}
						>
							{m.record_id()}
							{#if sortBy === 'recordId-asc'}
								<TypcnArrowSortedUp class="inline-block" />
							{:else if sortBy === 'recordId-desc'}
								<TypcnArrowSortedDown class="inline-block" />
							{:else}
								<TypcnArrowUnsorted class="inline-block" />
							{/if}
						</button>
					</th>
					<th class="px-4 py-1">
						<button
							class="flex items-center gap-1 text-left"
							class:text-white={sortBy === 'fieldName-asc' || sortBy === 'fieldName-desc'}
							onclick={() =>
								(sortBy = sortBy === 'fieldName-asc' ? 'fieldName-desc' : 'fieldName-asc')}
						>
							{m.field_name()}
							{#if sortBy === 'fieldName-asc'}
								<TypcnArrowSortedUp class="inline-block" />
							{:else if sortBy === 'fieldName-desc'}
								<TypcnArrowSortedDown class="inline-block" />
							{:else}
								<TypcnArrowUnsorted class="inline-block" />
							{/if}
						</button>
					</th>
					<th class="px-4 py-1">{m.old_value()}</th>
					<th class="px-4 py-1">{m.new_value()}</th>
					<th class="px-4 py-1">
						<button
							class="flex items-center gap-1 text-left"
							class:text-white={sortBy === 'editedBy-asc' || sortBy === 'editedBy-desc'}
							onclick={() =>
								(sortBy = sortBy === 'editedBy-asc' ? 'editedBy-desc' : 'editedBy-asc')}
						>
							{m.edited_by()}
							{#if sortBy === 'editedBy-asc'}
								<TypcnArrowSortedUp class="inline-block" />
							{:else if sortBy === 'editedBy-desc'}
								<TypcnArrowSortedDown class="inline-block" />
							{:else}
								<TypcnArrowUnsorted class="inline-block" />
							{/if}
						</button>
					</th>
					<th class="px-4 py-1">
						<button
							class="flex items-center gap-1 text-left"
							class:text-white={sortBy === 'editedAt-asc' || sortBy === 'editedAt-desc'}
							onclick={() =>
								(sortBy = sortBy === 'editedAt-asc' ? 'editedAt-desc' : 'editedAt-asc')}
						>
							{m.edited_at()}
							{#if sortBy === 'editedAt-asc'}
								<TypcnArrowSortedUp class="inline-block" />
							{:else if sortBy === 'editedAt-desc'}
								<TypcnArrowSortedDown class="inline-block" />
							{:else}
								<TypcnArrowUnsorted class="inline-block" />
							{/if}
						</button>
					</th>
				</tr>
			</thead>
			<tbody>
				{#each filteredRecords as record, idx (idx)}
					<tr>
						<td class="px-4 py-1 text-white">{record.editHistory.tableName}</td>
						<td class="max-w-32 truncate px-4 py-1 text-xs text-gray-300">
							{#if ['player', 'player_social_account', 'player_alias', 'game_account'].includes(record.editHistory.tableName)}
								<a
									href={`/admin/players?action=edit&id=${record.editHistory.recordId}`}
									class="text-yellow-500"
									title={record.editHistory.recordId}
								>
									{record.editHistory.recordId}
								</a>
							{:else}
								{record.editHistory.recordId}
							{/if}
						</td>
						<td class="px-4 py-1 text-white">{record.editHistory.fieldName}</td>
						<td class="px-4 py-1 text-gray-300">
							<pre class="text-sm break-words whitespace-pre-wrap">{formatValue(
									record.editHistory.oldValue
								)}</pre>
						</td>
						<td class="px-4 py-1 text-gray-300">
							<pre class="text-sm break-words whitespace-pre-wrap">{formatValue(
									record.editHistory.newValue
								)}</pre>
						</td>
						<td class="px-4 py-1 text-gray-300">
							{#if record.editor}
								<div class="flex flex-col">
									<span class="text-xs text-gray-400">{record.editor.id}</span>
									<span>{record.editor.username}</span>
								</div>
							{:else}
								-
							{/if}
						</td>
						<td class="px-4 py-1 text-gray-300">{formatDate(record.editHistory.editedAt)}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#if data.totalCount > data.limit}
		<div class="mt-4">
			<PageNavigator
				{currentPage}
				totalPages={Math.ceil(data.totalCount / data.limit)}
				onPageChange={handlePageChange}
			/>
		</div>
	{/if}
</main>
