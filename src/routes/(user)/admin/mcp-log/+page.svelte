<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	function fmt(d: Date | string): string {
		return new Date(d).toLocaleString();
	}

	function statusLabel(s: string): string {
		switch (s) {
			case 'success':
				return m.mcp_log_status_success();
			case 'denied':
				return m.mcp_log_status_denied();
			case 'error':
				return m.mcp_log_status_error();
			default:
				return m.mcp_log_status_rate_limited();
		}
	}

	function statusClass(s: string): string {
		if (s === 'success') return 'bg-green-500/20 text-green-300';
		if (s === 'rate_limited') return 'bg-yellow-500/20 text-yellow-300';
		return 'bg-red-500/20 text-red-300';
	}
</script>

<svelte:head>
	<title>{m.mcp_log_title()} | LemonTV</title>
</svelte:head>

<div class="space-y-6">
	<header class="space-y-1">
		<h1 class="text-2xl font-bold text-white">{m.mcp_log_title()}</h1>
		<p class="text-sm text-gray-400">{m.mcp_log_description()}</p>
	</header>

	<!-- Filter — a GET form navigates with ?status=… (resets to page 1). -->
	<form method="get" class="flex items-center gap-2">
		<label for="status" class="text-sm text-gray-300">{m.mcp_log_status()}</label>
		<select
			id="status"
			name="status"
			onchange={(e) => e.currentTarget.form?.requestSubmit()}
			class="rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
		>
			<option value="" selected={!data.status}>{m.mcp_log_all()}</option>
			{#each data.statuses as s (s)}
				<option value={s} selected={s === data.status}>{statusLabel(s)}</option>
			{/each}
		</select>
	</form>

	{#if data.entries.length === 0}
		<p
			class="rounded-lg border border-slate-800 bg-slate-900/40 p-6 text-center text-sm text-gray-400"
		>
			{m.mcp_log_empty()}
		</p>
	{:else}
		<div class="overflow-x-auto rounded-lg border border-slate-800">
			<table class="w-full text-left text-sm">
				<thead class="bg-slate-900/60 text-xs text-gray-400 uppercase">
					<tr>
						<th class="px-3 py-2">{m.mcp_log_col_time()}</th>
						<th class="px-3 py-2">{m.mcp_log_col_user()}</th>
						<th class="px-3 py-2">{m.mcp_log_col_token()}</th>
						<th class="px-3 py-2">{m.mcp_log_col_tool()}</th>
						<th class="px-3 py-2">{m.mcp_log_col_status()}</th>
						<th class="px-3 py-2">{m.mcp_log_col_detail()}</th>
						<th class="px-3 py-2">{m.mcp_log_col_ip()}</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-800">
					{#each data.entries as e (e.id)}
						<tr class="bg-slate-900/30">
							<td class="px-3 py-2 whitespace-nowrap text-gray-300">{fmt(e.createdAt)}</td>
							<td class="px-3 py-2 text-white">{e.username ?? '—'}</td>
							<td class="px-3 py-2 text-gray-300">
								{e.tokenName ?? '—'}
								{#if e.tokenPrefix}
									<code class="ml-1 font-mono text-xs text-slate-400">{e.tokenPrefix}…</code>
								{/if}
							</td>
							<td class="px-3 py-2 font-mono text-xs text-gray-300">{e.tool}</td>
							<td class="px-3 py-2">
								<span class="rounded px-1.5 py-0.5 text-xs font-medium {statusClass(e.status)}"
									>{statusLabel(e.status)}</span
								>
							</td>
							<td class="max-w-xs truncate px-3 py-2 text-gray-400" title={e.detail ?? ''}
								>{e.detail ?? ''}</td
							>
							<td class="px-3 py-2 font-mono text-xs text-gray-400">{e.ip ?? '—'}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Pagination via GET form (status preserved as a hidden field). -->
		<form method="get" class="flex items-center justify-between text-sm">
			{#if data.status}
				<input type="hidden" name="status" value={data.status} />
			{/if}
			<button
				type="submit"
				name="page"
				value={data.page - 1}
				disabled={data.page <= 1}
				class="rounded-md border border-slate-700 px-3 py-1.5 text-gray-300 hover:bg-slate-800 disabled:opacity-40"
			>
				{m.mcp_log_prev()}
			</button>
			<span class="text-gray-400"
				>{m.mcp_log_page_of({ page: data.page, total: data.totalPages })}</span
			>
			<button
				type="submit"
				name="page"
				value={data.page + 1}
				disabled={data.page >= data.totalPages}
				class="rounded-md border border-slate-700 px-3 py-1.5 text-gray-300 hover:bg-slate-800 disabled:opacity-40"
			>
				{m.mcp_log_next()}
			</button>
		</form>
	{/if}
</div>
