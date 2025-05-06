<script lang="ts">
	import { page } from '$app/state';
	import { m } from '$lib/paraglide/messages';
	import MaterialSymbolsChevronRightRounded from '~icons/material-symbols/chevron-right-rounded';

	let { showHome = true, currentTitle }: { showHome?: boolean; currentTitle?: string } = $props();

	let pathSegments = $derived(page.url.pathname.split('/').filter(Boolean));
	function getBreadcrumbLabel(segment: string): string {
		switch (segment) {
			case 'news':
				return m.news();
			case 'events':
				return m.events();
			case 'teams':
				return m.teams();
			case 'players':
				return m.players();
			case 'community':
				return m.community();
			default:
				return segment;
		}
	}
</script>

<nav class="flex items-center gap-1 px-8 py-4 text-sm text-gray-400">
	{#if showHome}
		<a href="/" class="transition-all duration-200 hover:text-white">Home</a>
		<MaterialSymbolsChevronRightRounded class="h-4 w-4" />
	{/if}

	{#each pathSegments as segment, i}
		{#if i === pathSegments.length - 1}
			<span class="text-white">{currentTitle ?? getBreadcrumbLabel(segment)}</span>
		{:else}
			<a
				href={`/${pathSegments.slice(0, i + 1).join('/')}`}
				class="transition-all duration-200 hover:text-white"
			>
				{getBreadcrumbLabel(segment)}
			</a>
			<MaterialSymbolsChevronRightRounded class="h-4 w-4" />
		{/if}
	{/each}
</nav>
