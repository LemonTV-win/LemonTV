<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import type { PageProps } from './$types';
	import { m } from '$lib/paraglide/messages';
	import InlineAlert from '$lib/components/InlineAlert.svelte';
	import Restore from '~icons/lucide/archive-restore';

	let { data }: PageProps = $props();

	let error: string | null = $state(null);
	let success: string | null = $state(null);

	function fmt(d: Date | string): string {
		return new Date(d).toLocaleString();
	}

	function handleRestore() {
		return async ({ result, update }: { result: ActionResult; update: () => Promise<void> }) => {
			if (result.type === 'failure') {
				error = (result.data?.error as string) ?? m.trash_restore_failed();
				success = null;
			} else if (result.type === 'error') {
				error = result.error?.message ?? m.trash_restore_failed();
				success = null;
			} else {
				error = null;
				success = m.trash_restored();
			}
			await update();
		};
	}
</script>

<svelte:head>
	<title>{m.trash_title()} | LemonTV</title>
</svelte:head>

<div class="space-y-6">
	<header class="space-y-1">
		<h1 class="text-2xl font-bold text-white">{m.trash_title()}</h1>
		<p class="text-sm text-gray-400">{m.trash_description()}</p>
	</header>

	{#if error}
		<InlineAlert type="error" message={error} />
	{/if}
	{#if success}
		<InlineAlert type="success" message={success} />
	{/if}

	{#if data.entries.length === 0}
		<p
			class="rounded-lg border border-slate-800 bg-slate-900/40 p-6 text-center text-sm text-gray-400"
		>
			{m.trash_empty()}
		</p>
	{:else}
		<div class="overflow-x-auto rounded-lg border border-slate-800">
			<table class="w-full text-left text-sm">
				<thead class="bg-slate-900/60 text-xs text-gray-400 uppercase">
					<tr>
						<th class="px-3 py-2">{m.trash_col_type()}</th>
						<th class="px-3 py-2">{m.trash_col_item()}</th>
						<th class="px-3 py-2">{m.trash_col_deleted_at()}</th>
						<th class="px-3 py-2">{m.trash_col_deleted_by()}</th>
						<th class="px-3 py-2"></th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-800">
					{#each data.entries as entry (entry.id)}
						<tr class="bg-slate-900/30">
							<td class="px-3 py-2 text-gray-300 capitalize">{entry.entity}</td>
							<td class="px-3 py-2 text-white">
								{entry.label ?? '—'}
								<code class="ml-1 font-mono text-xs text-slate-500">{entry.recordId}</code>
							</td>
							<td class="px-3 py-2 whitespace-nowrap text-gray-400">{fmt(entry.deletedAt)}</td>
							<td class="px-3 py-2 text-gray-400">{entry.deletedByName ?? '—'}</td>
							<td class="px-3 py-2 text-right">
								<form method="post" action="?/restore" use:enhance={handleRestore}>
									<input type="hidden" name="entity" value={entry.entity} />
									<input type="hidden" name="recordId" value={entry.recordId} />
									<button
										type="submit"
										class="inline-flex items-center gap-1 rounded-md border border-green-700/60 px-3 py-1.5 text-sm text-green-300 hover:bg-green-500/10"
									>
										<Restore class="h-4 w-4" />
										{m.trash_restore()}
									</button>
								</form>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
