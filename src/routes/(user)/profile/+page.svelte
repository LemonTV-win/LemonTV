<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageServerData } from './$types';
	import { m } from '$lib/paraglide/messages';
	import UserAvatar from '$lib/components/UserAvatar.svelte';
	import LogosGravatarIcon from '~icons/logos/gravatar-icon';

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
