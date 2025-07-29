<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageServerData } from './$types';
	import { m } from '$lib/paraglide/messages';
	import UserAvatar from '$lib/components/UserAvatar.svelte';
	import LogosGravatarIcon from '~icons/logos/gravatar-icon';
	import IconAccountCircle from '~icons/material-symbols/account-circle';
	import IconId from '~icons/mdi/identifier';
	import IconEmail from '~icons/material-symbols/mail-outline-rounded';
	import IconRoles from '~icons/material-symbols/verified-user-rounded';

	let { data }: { data: PageServerData } = $props();
</script>

<svelte:head>
	<title>{m.profile_settings()} | LemonTV</title>
</svelte:head>

<div class="space-y-8">
	<div class="flex items-center gap-4 rounded-md border border-slate-800 bg-slate-800/50 p-4">
		<a
			href="https://gravatar.com"
			target="_blank"
			rel="noopener noreferrer"
			class="group relative"
			title="Gravatar"
		>
			<UserAvatar email={data.user.email} class="h-24 w-24" />
			<div
				class="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"
			>
				<LogosGravatarIcon class="h-12 w-12 text-white" />
			</div>
		</a>
		<div>
			<p class="mb-2 text-xl font-medium text-white">
				{m.welcome({ username: data.user.username })}
			</p>
			<a
				href="https://gravatar.com"
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-300"
			>
				{m.change_avatar()}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="inline-block"
				>
					<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
					<polyline points="15 3 21 3 21 9" />
					<line x1="10" y1="14" x2="21" y2="3" />
				</svg>
			</a>
		</div>
	</div>

	<div class="space-y-1 rounded-md border border-slate-800 bg-slate-800/50 p-4">
		<div class="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
			<IconAccountCircle class="h-8 w-8 text-white" />
			Account Details
		</div>
		<div class="flex items-center gap-2 border-b border-slate-700 py-2">
			<IconId class="h-4 w-4 text-slate-400" />
			<span class="text-slate-400">{m.user_id()}:</span>
			<span class="ml-1 font-mono text-slate-200">{data.user.id}</span>
		</div>
		<div class="flex items-center gap-2 border-b border-slate-700 py-2">
			<IconEmail class="h-4 w-4 text-slate-400" />
			<span class="text-slate-400">{m.email()}:</span>
			<span class="ml-1 text-slate-200">{data.user.email}</span>
		</div>
		<div class="flex items-center gap-2 py-2">
			<IconRoles class="h-4 w-4 text-slate-400" />
			<span class="text-slate-400">{m.roles()}:</span>
			{#each data.user.roles as role (role)}
				{#if role === 'admin'}
					<span class="ml-1 font-semibold text-yellow-400">{m.admin()}</span>
				{:else if role === 'editor'}
					<span class="ml-1 font-semibold text-green-400">{m.editor()}</span>
				{:else}
					<span class="ml-1 text-slate-300">{role}</span>
				{/if}
			{/each}
		</div>
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
