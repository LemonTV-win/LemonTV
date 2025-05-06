<script lang="ts">
	import { page } from '$app/state';
	import { m } from '$lib/paraglide/messages';
	import MaterialSymbolsChevronRightRounded from '~icons/material-symbols/chevron-right-rounded';

	let {
		showHome = true,
		currentTitle,
		parentTitle,
		customSegments,
		customUrls
	}: {
		showHome?: boolean;
		currentTitle?: string;
		parentTitle?: string;
		customSegments?: string[];
		customUrls?: string[];
	} = $props();

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
			case 'matches':
				return m.matches();
			default:
				return segment;
		}
	}

	function getSegmentLabel(segment: string, index: number): string {
		if (segment === pathSegments[0] && parentTitle) {
			return parentTitle;
		}
		return getBreadcrumbLabel(segment);
	}

	function getSegmentUrl(segments: string[], index: number): string {
		if (customUrls && customUrls[index]) {
			return customUrls[index];
		}
		return `/${segments.slice(0, index + 1).join('/')}`;
	}

	let displaySegments = $derived.by(() => {
		if (customSegments) {
			return customSegments;
		}
		return pathSegments;
	});
</script>

<nav class="flex items-center gap-1 px-8 py-4 text-sm text-gray-400">
	{#if showHome}
		<a href="/" class="transition-all duration-200 hover:text-white">{m.home()}</a>
		<MaterialSymbolsChevronRightRounded class="h-4 w-4" />
	{/if}

	{#each displaySegments as segment, i}
		{#if i === displaySegments.length - 1}
			<span class="text-white">{currentTitle ?? getBreadcrumbLabel(segment)}</span>
		{:else}
			<a
				href={getSegmentUrl(displaySegments, i)}
				class="transition-all duration-200 hover:text-white"
			>
				{getSegmentLabel(segment, i)}
			</a>
			<MaterialSymbolsChevronRightRounded class="h-4 w-4" />
		{/if}
	{/each}
</nav>
