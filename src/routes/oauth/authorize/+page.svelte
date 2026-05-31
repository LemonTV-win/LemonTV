<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import ShieldCheck from '~icons/lucide/shield-check';
	import KeyRound from '~icons/lucide/key-round';
	import Eye from '~icons/lucide/eye';
	import Pencil from '~icons/lucide/pencil';
	import type { PageServerData } from './$types';

	type FormResult = { ok: false; message: string } | null;
	let { data, form }: { data: PageServerData; form: FormResult } = $props();

	const scopeMeta: Record<string, { label: () => string; icon: typeof Eye }> = {
		'mcp:read': { label: () => m.oauth_scope_read(), icon: Eye },
		'mcp:write': { label: () => m.oauth_scope_write(), icon: Pencil }
	};
</script>

<svelte:head>
	<title>{m.oauth_authorize_title()} — LemonTV</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="flex min-h-[70vh] items-center justify-center px-4 py-10">
	<div class="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-8 shadow-xl">
		{#if !data.ok || form?.ok === false}
			<div class="flex flex-col items-center text-center">
				<KeyRound class="mb-3 h-10 w-10 text-red-400" />
				<h1 class="mb-2 text-xl font-bold text-white">{m.oauth_authorize_error_title()}</h1>
				<p class="text-sm text-zinc-400">
					{form?.ok === false ? form.message : !data.ok ? data.message : ''}
				</p>
				<a href="/" class="mt-6 text-sm text-yellow-400 hover:underline">LemonTV</a>
			</div>
		{:else}
			<div class="mb-6 flex flex-col items-center text-center">
				<ShieldCheck class="mb-3 h-10 w-10 text-yellow-400" />
				<h1 class="text-xl font-bold text-white">{m.oauth_authorize_title()}</h1>
				<p class="mt-2 text-sm text-zinc-300">
					{m.oauth_authorize_app_wants({
						app: data.clientName ?? m.oauth_authorize_unknown_app()
					})}
				</p>
				{#if data.clientUri}
					<a
						href={data.clientUri}
						class="mt-1 text-xs text-zinc-500 hover:underline"
						target="_blank"
						rel="noopener noreferrer">{data.clientUri}</a
					>
				{/if}
			</div>

			<p class="mb-2 text-xs font-semibold tracking-wide text-zinc-400 uppercase">
				{m.oauth_authorize_permissions()}
			</p>
			<ul class="mb-6 space-y-2">
				{#each data.scopes as scope (scope)}
					{@const meta = scopeMeta[scope]}
					<li class="flex items-start gap-3 rounded-lg bg-zinc-800/60 px-3 py-2">
						{#if meta}
							<meta.icon class="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />
							<span class="text-sm text-zinc-200">{meta.label()}</span>
						{:else}
							<span class="text-sm text-zinc-200">{scope}</span>
						{/if}
					</li>
				{/each}
			</ul>

			<p class="mb-4 text-center text-xs text-zinc-500">{m.oauth_authorize_review_note()}</p>

			<form method="POST" class="flex flex-col gap-3">
				<input type="hidden" name="csrf" value={data.csrf} />
				{#each Object.entries(data.fields) as [name, value] (name)}
					<input type="hidden" {name} {value} />
				{/each}

				<div class="flex gap-3">
					<button
						type="submit"
						formaction="?/deny"
						class="flex-1 rounded-lg border border-zinc-600 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800"
					>
						{m.oauth_deny_button()}
					</button>
					<button
						type="submit"
						formaction="?/approve"
						class="flex-1 rounded-lg bg-yellow-400 px-4 py-2.5 text-sm font-bold text-zinc-900 transition hover:bg-yellow-300"
					>
						{m.oauth_authorize_button()}
					</button>
				</div>
			</form>

			<p class="mt-5 text-center text-xs text-zinc-500">
				{m.oauth_authorize_signed_in_as({ username: data.username })}
			</p>
		{/if}
	</div>
</div>
