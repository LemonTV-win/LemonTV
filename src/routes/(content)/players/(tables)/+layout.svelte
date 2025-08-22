<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { page } from '$app/state';

	import ContentActionLink from '$lib/components/ContentActionLink.svelte';
	import type { LayoutProps } from './$types';
	import SearchInput from '$lib/components/SearchInput.svelte';
	import { goto } from '$app/navigation';

	let { data, children }: LayoutProps = $props();

	let activeTab = $derived(page.url.pathname.split('/').pop() || 'players');

	let search = $state(page.data.search || '');

	$effect(() => {
		const url = new URL(window.location.href);
		if (search) {
			url.searchParams.set('search', search);
		} else {
			url.searchParams.delete('search');
		}
		goto(url.toString(), { replaceState: true, keepFocus: true });
	});
</script>

<main class="mx-auto max-w-screen-lg px-4">
	<div
		class="mt-6 mb-5 flex flex-col gap-3 px-2 sm:flex-row sm:items-center sm:justify-between sm:px-0"
	>
		<div class="flex items-center gap-3 text-white/80">
			<h1 class="text-2xl font-semibold">{m.players()}</h1>
			{#if ['admin', 'editor'].some((role) => data.user?.roles.includes(role))}
				<ContentActionLink href="/admin/players" type="edit" />
			{/if}
		</div>

		{#if page.url.pathname === '/players'}
			<div class="flex w-full items-center justify-end sm:w-auto">
				<SearchInput
					{search}
					bind:debounced={search}
					filtered={page.data.players.length}
					total={page.data.totalCount}
				/>
			</div>
		{/if}
	</div>

	<!-- Divider -->
	<!-- <div class="my-4 h-px w-full bg-white/25"></div> -->

	<!-- Tab Navigation -->
	{#snippet tabButton(active: boolean, href: string, text: string)}
		<a
			class={[
				'flex-1 cursor-pointer border-b-2 px-4 py-2 text-center text-sm font-medium transition-colors',
				active
					? 'border-blue-500 bg-slate-700/50 text-blue-400 backdrop-blur-md'
					: 'border-white/30 bg-transparent text-gray-400 backdrop-blur-md'
			]}
			{href}
		>
			{text}
		</a>
	{/snippet}

	<div
		class="mb-6 flex border border-white/30 border-b-transparent bg-slate-600/50 bg-gradient-to-br to-slate-800/50 backdrop-blur-lg"
	>
		{@render tabButton(activeTab === 'players', '/players', m.players())}
		{@render tabButton(activeTab === 'regions', '/players/regions', m.region_ranking())}
		{@render tabButton(
			activeTab === 'superstrings',
			'/players/superstrings',
			m.superstring_power()
		)}
	</div>

	{@render children()}
</main>
