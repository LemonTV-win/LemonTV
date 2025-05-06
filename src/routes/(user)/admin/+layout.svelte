<script lang="ts">
	import type { LayoutProps } from './$types';
	import { page } from '$app/state';
	import { m } from '$lib/paraglide/messages';

	let { children }: LayoutProps = $props();
</script>

<div class="grid h-screen grid-cols-[280px_1fr]">
	<nav class="flex flex-col gap-4 border-r border-gray-800 bg-gray-900/50 p-6">
		<div class="mb-6">
			<h1 class="text-2xl font-bold text-white">{m.admin_panel()}</h1>
		</div>
		<a
			class="rounded-lg px-4 py-2 text-lg font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white {page
				.url.pathname === '/admin'
				? 'bg-gray-800 text-white'
				: ''}"
			href="/admin"
		>
			{m.home()}
		</a>
		<a
			class="rounded-lg px-4 py-2 text-lg font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white {page
				.url.pathname === '/admin/users'
				? 'bg-gray-800 text-white'
				: ''}"
			href="/admin/users"
		>
			{m.users()}
		</a>
		<a
			class="rounded-lg px-4 py-2 text-lg font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white {page
				.url.pathname === '/admin/players'
				? 'bg-gray-800 text-white'
				: ''}"
			href="/admin/players"
		>
			{m.players()}
		</a>
	</nav>
	<main class="overflow-auto p-8">
		{@render children()}
	</main>
</div>
