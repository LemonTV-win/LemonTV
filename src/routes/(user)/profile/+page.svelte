<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageServerData } from './$types';
	import { m } from '$lib/paraglide/messages';

	let { data }: { data: PageServerData } = $props();
</script>

<svelte:head>
	<title>{m.profile_settings()} | LemonTV</title>
</svelte:head>

<div class="space-y-8">
	<div class="rounded-md border border-slate-800 bg-slate-800/50 p-4">
		<p class="mb-2 text-xl font-medium text-white">
			{m.welcome({ username: data.user.username })}
		</p>
		<p class="text-sm text-slate-400">{m.user_id()}: {data.user.id}</p>
		<p class="text-sm text-slate-400">{m.email()}: {data.user.email}</p>
		<p class="text-sm text-slate-400">
			{m.roles()}: {#each data.user.roles as role}
				{#if role === 'admin'}
					<span class="text-yellow-500">{m.admin()}</span>
				{:else if role === 'editor'}
					<span class="text-green-500">{m.editor()}</span>
				{:else}
					<span class="text-slate-400">{role}</span>
				{/if}
			{/each}
		</p>
	</div>

	<form method="post" action="?/logout" use:enhance class="border-t border-slate-800 pt-6">
		<button
			type="submit"
			class="w-full rounded-md border border-slate-700 px-4 py-2 text-white hover:bg-slate-800 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900 focus:outline-none"
		>
			{m.sign_out()}
		</button>
	</form>
</div>
