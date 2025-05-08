<script lang="ts">
	import type { EditHistory } from '$lib/server/db/schemas/edit-history';
	import { formatDistanceToNow, format } from 'date-fns';
	import UserAvatar from '$lib/components/UserAvatar.svelte';

	let { playerId, onClose } = $props<{
		playerId: string;
		onClose: () => void;
	}>();

	interface EditHistoryWithEditor extends EditHistory {
		editor?: { id: string; name: string; email: string };
	}

	let history: EditHistoryWithEditor[] = $state([]);
	let loading = $state(true);
	let error: string | null = $state(null);

	let groupedHistory = $state<Record<string, EditHistoryWithEditor[]>>({});
	let sortedDates = $derived(Object.keys(groupedHistory).sort((a, b) => b.localeCompare(a)));

	async function loadHistory() {
		loading = true;
		error = null;
		try {
			const response = await fetch(`/api/players/${playerId}/history`);
			if (!response.ok) {
				throw new Error('Failed to fetch history');
			}
			history = await response.json();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load history';
			console.error('Error loading history:', e);
		} finally {
			loading = false;
		}
	}

	$inspect('history', history);
	$inspect('loading', loading);
	$inspect('groupedHistory', groupedHistory);
	$inspect('sortedDates', sortedDates);

	$effect(() => {
		if (playerId) {
			loadHistory();
		}
	});

	// Initialize groupedHistory
	$effect(() => {
		groupedHistory = history.reduce(
			(acc, entry) => {
				// Convert Unix timestamp (seconds) to milliseconds for Date constructor
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
	});

	function formatValue(value: string | null) {
		if (value === null) return '<deleted>';
		if (value === 'created') return 'Created';
		if (value === 'deleted') return 'Deleted';
		return value;
	}

	function getFieldLabel(fieldName: string) {
		switch (fieldName) {
			case 'name':
				return 'Name';
			case 'nationality':
				return 'Nationality';
			case 'alias':
				return 'Alias';
			case 'account':
				return 'Account';
			case 'creation':
				return 'Creation';
			case 'deletion':
				return 'Deletion';
			default:
				return fieldName;
		}
	}

	function getTableLabel(tableName: string) {
		switch (tableName) {
			case 'player':
				return 'Player';
			case 'player_alias':
				return 'Alias';
			case 'game_account':
				return 'Game Account';
			case 'player_social_account':
				return 'Social Account';
			default:
				return tableName;
		}
	}

	function formatTime(date: Date) {
		return format(date, 'HH:mm:ss');
	}
</script>

<div
	class="space-y-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb:hover]:bg-slate-500 [&::-webkit-scrollbar-track]:bg-slate-800"
>
	{#each sortedDates as date}
		<div class="space-y-3">
			<h3 class="sticky top-0 z-10 bg-slate-900/95 py-2 text-sm font-medium text-slate-400">
				{new Date(date).toLocaleDateString()} ({formatDistanceToNow(new Date(date), {
					addSuffix: true
				})})
			</h3>
			<div class="space-y-3">
				{#each groupedHistory[date] as entry}
					<div class="rounded-lg border border-slate-800 bg-slate-900/95 p-4 shadow-lg">
						<div class="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
							<div class="flex flex-col gap-1">
								<div class="flex items-center gap-2">
									<span class="font-medium text-slate-300">{getTableLabel(entry.tableName)}</span>
									<span class="text-slate-400">•</span>
									<span class="text-slate-400">{getFieldLabel(entry.fieldName)}</span>
								</div>
								<div class="flex items-center gap-2 text-xs text-slate-500">
									<span>{formatTime(entry.editedAt)}</span>
									{#if entry.editor}
										<span>•</span>
										<span>by {entry.editor.name}</span>
									{/if}
								</div>
							</div>
							{#if entry.editor}
								<div class="flex items-center gap-2 text-sm text-slate-400" title={entry.editor.id}>
									<UserAvatar email={entry.editor.email} class="h-8 w-8" />
								</div>
							{/if}
						</div>
						<div class="flex items-center gap-3 rounded-md bg-slate-800/50 p-3">
							{#if entry.oldValue !== null}
								<span class="text-slate-400 line-through">{formatValue(entry.oldValue)}</span>
							{:else}
								<span class="text-slate-400">(no-data)</span>
							{/if}
							<span class="text-slate-500">→</span>
							{#if entry.newValue !== null}
								<span class="font-medium text-yellow-500">{formatValue(entry.newValue)}</span>
							{:else}
								<span class="text-slate-400">(no-data)</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/each}
</div>
