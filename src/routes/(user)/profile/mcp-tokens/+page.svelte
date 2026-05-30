<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import type { PageProps } from './$types';
	import { m } from '$lib/paraglide/messages';
	import InlineAlert from '$lib/components/InlineAlert.svelte';
	import Key from '~icons/lucide/key-round';
	import Copy from '~icons/lucide/copy';
	import Check from '~icons/lucide/check';
	import Trash from '~icons/lucide/trash-2';

	let { data, form }: PageProps = $props();

	let error: string | null = $state(null);
	let copied = $state(false);

	// The freshly-minted plaintext token, available only in the create action's
	// result. Cleared on any subsequent navigation/refresh — never stored.
	let createdToken = $derived(form && 'created' in form ? form.created : null);

	function fmtDate(d: Date | string | null | undefined): string {
		if (!d) return '—';
		return new Date(d).toLocaleString();
	}

	function tokenStatus(token: {
		revokedAt: Date | string | null;
		expiresAt: Date | string | null;
	}): 'active' | 'revoked' | 'expired' {
		if (token.revokedAt) return 'revoked';
		if (token.expiresAt && new Date(token.expiresAt).getTime() <= Date.now()) return 'expired';
		return 'active';
	}

	function scopeLabel(scope: string): string {
		return scope === 'write' ? m.mcp_scope_write() : m.mcp_scope_read();
	}

	function statusLabel(status: 'revoked' | 'expired'): string {
		return status === 'revoked' ? m.mcp_token_status_revoked() : m.mcp_token_status_expired();
	}

	function handleCreate() {
		return async ({
			result,
			update
		}: {
			result: ActionResult;
			update: (options?: { reset?: boolean; invalidateAll?: boolean }) => Promise<void>;
		}) => {
			if (result.type === 'failure') {
				error = (result.data?.error as string) ?? m.mcp_token_create_failed();
			} else if (result.type === 'error') {
				error = result.error?.message ?? m.mcp_token_create_failed();
			} else {
				error = null;
			}
			// Refresh the token list but keep the action result (the plaintext).
			await update({ reset: false });
		};
	}

	function handleRevoke() {
		return async ({
			result,
			update
		}: {
			result: ActionResult;
			update: (options?: { reset?: boolean; invalidateAll?: boolean }) => Promise<void>;
		}) => {
			if (result.type === 'failure') {
				error = (result.data?.error as string) ?? m.mcp_token_revoke_failed();
			} else {
				error = null;
			}
			await update();
		};
	}

	async function copyToken() {
		if (!createdToken) return;
		await navigator.clipboard.writeText(createdToken.token);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<svelte:head>
	<title>{m.mcp_tokens()} | LemonTV</title>
</svelte:head>

<div class="mx-auto max-w-3xl space-y-8">
	<header class="space-y-2">
		<h2 class="flex items-center gap-2 text-xl font-semibold text-white">
			<Key class="h-6 w-6 text-yellow-500" />
			{m.mcp_tokens_heading()}
		</h2>
		<p class="text-sm text-slate-400">{m.mcp_tokens_description()}</p>
	</header>

	{#if error}
		<InlineAlert type="error" message={error} />
	{/if}

	{#if createdToken}
		<div class="space-y-3 rounded-lg border border-yellow-600/50 bg-yellow-500/10 p-4">
			<p class="text-sm font-medium text-yellow-300">
				{m.mcp_token_reveal({
					name: createdToken.name,
					scope: scopeLabel(createdToken.scope)
				})}
			</p>
			<div class="flex items-center gap-2">
				<code
					class="flex-1 overflow-x-auto rounded-md border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-sm text-yellow-200"
					>{createdToken.token}</code
				>
				<button
					type="button"
					onclick={copyToken}
					class="flex items-center gap-1 rounded-md bg-yellow-500 px-3 py-2 text-sm font-medium text-black hover:bg-yellow-600"
				>
					{#if copied}
						<Check class="h-4 w-4" />
						{m.mcp_copied()}
					{:else}
						<Copy class="h-4 w-4" />
						{m.mcp_copy()}
					{/if}
				</button>
			</div>
		</div>
	{/if}

	<!-- Create form -->
	<section class="space-y-4 rounded-lg border border-slate-800 bg-slate-900/50 p-5">
		<h3 class="text-lg font-semibold text-white">{m.mcp_token_generate_heading()}</h3>
		<form method="post" action="?/create" use:enhance={handleCreate} class="space-y-4">
			<div class="space-y-2">
				<label for="name" class="block text-sm text-white">{m.mcp_token_name()}</label>
				<input
					id="name"
					name="name"
					required
					maxlength="100"
					placeholder={m.mcp_token_name_placeholder()}
					class="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
				/>
			</div>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div class="space-y-2">
					<label for="scope" class="block text-sm text-white">{m.mcp_token_scope()}</label>
					<select
						id="scope"
						name="scope"
						class="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
					>
						<option value="read">{m.mcp_token_scope_read()}</option>
						<option value="write">{m.mcp_token_scope_write()}</option>
					</select>
				</div>
				<div class="space-y-2">
					<label for="expiry" class="block text-sm text-white">{m.mcp_token_expires()}</label>
					<select
						id="expiry"
						name="expiry"
						class="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
					>
						<option value="90">{m.mcp_token_expiry_90d()}</option>
						<option value="30">{m.mcp_token_expiry_30d()}</option>
						<option value="7">{m.mcp_token_expiry_7d()}</option>
						<option value="365">{m.mcp_token_expiry_1y()}</option>
						<option value="never">{m.mcp_token_expiry_never()}</option>
					</select>
				</div>
			</div>
			<button
				type="submit"
				class="rounded-md bg-yellow-500 px-4 py-2 font-medium text-black hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
			>
				{m.mcp_token_generate()}
			</button>
		</form>
	</section>

	<!-- Token list -->
	<section class="space-y-3">
		<h3 class="text-lg font-semibold text-white">{m.mcp_tokens_your_tokens()}</h3>
		{#if data.tokens.length === 0}
			<p class="text-sm text-slate-400">{m.mcp_tokens_empty()}</p>
		{:else}
			<ul class="divide-y divide-slate-800 overflow-hidden rounded-lg border border-slate-800">
				{#each data.tokens as token (token.id)}
					{@const status = tokenStatus(token)}
					<li class="flex items-center justify-between gap-4 bg-slate-900/40 px-4 py-3">
						<div class="min-w-0 space-y-1">
							<div class="flex items-center gap-2">
								<span class="truncate font-medium text-white">{token.name}</span>
								<span
									class="rounded px-1.5 py-0.5 text-xs font-medium {token.scope === 'write'
										? 'bg-yellow-500/20 text-yellow-300'
										: 'bg-slate-700 text-slate-300'}">{scopeLabel(token.scope)}</span
								>
								{#if status !== 'active'}
									<span class="rounded bg-red-500/20 px-1.5 py-0.5 text-xs font-medium text-red-300"
										>{statusLabel(status)}</span
									>
								{/if}
							</div>
							<div class="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-400">
								<code class="font-mono text-slate-300">{token.prefix}…</code>
								<span>{m.mcp_token_created_at()} {fmtDate(token.createdAt)}</span>
								<span>{m.mcp_token_last_used()} {fmtDate(token.lastUsedAt)}</span>
								<span
									>{m.mcp_token_expires()}
									{token.expiresAt ? fmtDate(token.expiresAt) : m.mcp_token_never()}</span
								>
							</div>
						</div>
						{#if status === 'active'}
							<form method="post" action="?/revoke" use:enhance={handleRevoke}>
								<input type="hidden" name="id" value={token.id} />
								<button
									type="submit"
									class="flex items-center gap-1 rounded-md border border-red-700/60 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/10"
								>
									<Trash class="h-4 w-4" />
									{m.mcp_token_revoke()}
								</button>
							</form>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</div>
