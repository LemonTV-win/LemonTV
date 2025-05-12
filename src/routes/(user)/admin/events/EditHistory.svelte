<!-- src/routes/(user)/admin/events/EditHistory.svelte -->
<script lang="ts">
	import type { EditHistory } from '$lib/server/db/schemas/edit-history';
	import { formatDistanceToNow, format } from 'date-fns';
	import UserAvatar from '$lib/components/UserAvatar.svelte';
	import { m } from '$lib/paraglide/messages';

	let {
		recordId
	}: {
		recordId: string;
	} = $props();

	interface EditHistoryWithEditor extends EditHistory {
		editor?: { id: string; name: string; email: string };
	}

	let history: EditHistoryWithEditor[] = $state([]);
	let loading = $state(true);
	let error: string | null = $state(null);

	let groupedHistory = $state<Record<string, EditHistoryWithEditor[]>>({});
	let sortedDates = $derived(Object.keys(groupedHistory).sort((a, b) => b.localeCompare(a)));

	// Overview statistics
	let totalEdits = $derived(history.length);
	let uniqueEditors = $derived(new Set(history.map((entry) => entry.editor?.id)).size);
	let firstEdit = $derived(
		history.length > 0
			? new Date(Math.min(...history.map((entry) => entry.editedAt.getTime())))
			: null
	);
	let lastEdit = $derived(
		history.length > 0
			? new Date(Math.max(...history.map((entry) => entry.editedAt.getTime())))
			: null
	);
	let editTypes = $derived(
		history.reduce(
			(acc, entry) => {
				const type = `${entry.tableName} - ${getFieldLabel(entry.fieldName)}`;
				acc[type] = (acc[type] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>
		)
	);

	async function loadHistory() {
		loading = true;
		error = null;
		try {
			const response = await fetch(`/api/events/${recordId}/history`);
			if (!response.ok) {
				throw new Error(m.failed_to_load_history());
			}
			history = (await response.json()).map((entry: any) => ({
				...entry,
				editedAt: new Date(Date.parse(entry.editedAt))
			}));
		} catch (e) {
			error = e instanceof Error ? e.message : m.failed_to_load_history();
			console.error('Error loading history:', e);
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		if (recordId) {
			loadHistory();
		}
	});

	// Initialize groupedHistory
	$effect(() => {
		groupedHistory = history.reduce(
			(acc, entry) => {
				const date = new Date(entry.editedAt);
				if (isNaN(date.getTime())) {
					console.error('Invalid date created from timestamp:', date);
					return acc;
				}
				const dateKey = date.toISOString().split('T')[0];
				if (!acc[dateKey]) {
					acc[dateKey] = [];
				}
				acc[dateKey].push(entry);
				return acc;
			},
			{} as Record<string, EditHistory[]>
		);

		// Sort entries within each date group by time in descending order
		Object.keys(groupedHistory).forEach((dateKey) => {
			groupedHistory[dateKey].sort((a, b) => b.editedAt.getTime() - a.editedAt.getTime());
		});
	});

	function formatValue(value: string | null) {
		if (value === null) return m.deleted();
		if (value === 'created') return m.created();
		if (value === 'deleted') return m.deleted();
		return value;
	}

	function getFieldLabel(fieldName: string) {
		switch (fieldName) {
			case 'name':
				return m.name();
			case 'slug':
				return m.slug();
			case 'server':
				return m.server();
			case 'format':
				return m.format();
			case 'region':
				return m.region();
			case 'status':
				return 'Status';
			case 'capacity':
				return m.capacity();
			case 'date':
				return m.date();
			case 'image':
				return m.image();
			case 'official':
				return m.official();
			case 'creation':
				return m.created();
			case 'deletion':
				return m.deleted();
			default:
				return fieldName;
		}
	}

	function formatTime(date: Date) {
		return format(date, 'HH:mm:ss');
	}
</script>

<div class="space-y-6 pr-2">
	{#if error}
		<div class="rounded-md bg-red-900/50 p-4 text-red-200" role="alert">
			<span class="block sm:inline">{error}</span>
		</div>
	{/if}

	{#if loading}
		<div class="flex items-center justify-center p-8">
			<div
				class="h-8 w-8 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent"
			></div>
		</div>
	{:else}
		<!-- Overview Section -->
		<div class="rounded-lg border border-slate-800 bg-slate-900/95 p-4 shadow-lg">
			<h2 class="mb-4 text-lg font-medium text-slate-200">{m.edit_history_overview()}</h2>
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<div class="rounded-md bg-slate-800/50 p-3">
					<div class="text-sm text-slate-400">{m.total_edits()}</div>
					<div class="text-xl font-medium text-slate-200">{totalEdits}</div>
				</div>
				<div class="rounded-md bg-slate-800/50 p-3">
					<div class="text-sm text-slate-400">{m.unique_editors()}</div>
					<div class="text-xl font-medium text-slate-200">{uniqueEditors}</div>
				</div>
				{#if firstEdit}
					<div class="rounded-md bg-slate-800/50 p-3">
						<div class="text-sm text-slate-400">{m.first_edit()}</div>
						<div class="text-sm text-slate-200">
							{format(firstEdit, 'MMM d, yyyy')}
							<span class="text-slate-400">
								({formatDistanceToNow(firstEdit, { addSuffix: true })})</span
							>
						</div>
					</div>
				{/if}
				{#if lastEdit}
					<div class="rounded-md bg-slate-800/50 p-3">
						<div class="text-sm text-slate-400">{m.last_edit()}</div>
						<div class="text-sm text-slate-200">
							{format(lastEdit, 'MMM d, yyyy')}
							<span class="text-slate-400">
								({formatDistanceToNow(lastEdit, { addSuffix: true })})</span
							>
						</div>
					</div>
				{/if}
			</div>
			{#if Object.keys(editTypes).length > 0}
				<div class="mt-4">
					<div class="mb-2 text-sm font-medium text-slate-400">{m.edit_types()}</div>
					<div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
						{#each Object.entries(editTypes) as [type, count]}
							<div class="flex items-center justify-between rounded-md bg-slate-800/50 px-3 py-2">
								<span class="text-sm text-slate-300">{type}</span>
								<span class="text-sm font-medium text-slate-400">{count}</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<!-- Edit History Records -->
		<div class="space-y-6">
			{#each sortedDates as date}
				<div class="space-y-3">
					<h3 class="text sticky top-0 z-10 bg-slate-900/95 py-2 font-medium text-slate-300">
						{new Date(date).toLocaleDateString()}
					</h3>
					<div class="space-y-3">
						{#each groupedHistory[date] as entry}
							<div class="rounded-lg border border-slate-800 bg-slate-900/95 p-4 shadow-lg">
								<div
									class="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
								>
									<div class="flex flex-col gap-1">
										<div class="flex items-center gap-2">
											<span class="font-medium text-slate-300">{entry.tableName}</span>
											<span class="text-slate-400">•</span>
											<span class="text-slate-400">{getFieldLabel(entry.fieldName)}</span>
										</div>
										<div class="flex items-center gap-2 text-xs text-slate-500">
											<span>{formatTime(entry.editedAt)}</span>
											<span>({formatDistanceToNow(entry.editedAt, { addSuffix: true })})</span>
										</div>
									</div>
									{#if entry.editor}
										<div
											class="flex items-center gap-2 text-sm text-slate-400"
											title={entry.editor.id}
										>
											<UserAvatar email={entry.editor.email} class="h-8 w-8" />
											<span>{entry.editor.name}</span>
										</div>
									{/if}
								</div>
								<div class="flex items-center gap-3 rounded-md bg-slate-800/50 p-3">
									{#if entry.oldValue !== null}
										<span class="text-slate-400 line-through">{formatValue(entry.oldValue)}</span>
									{:else}
										<span class="text-slate-400">({m.no_data()})</span>
									{/if}
									<span class="text-slate-500">→</span>
									{#if entry.newValue !== null}
										<span class="font-medium text-yellow-500">{formatValue(entry.newValue)}</span>
									{:else}
										<span class="text-slate-400">({m.no_data()})</span>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
