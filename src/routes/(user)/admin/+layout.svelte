<script lang="ts">
	import type { LayoutProps } from './$types';
	import { page } from '$app/state';
	import { m } from '$lib/paraglide/messages';

	import IconParkSolidShield from '~icons/icon-park-solid/shield';
	import MaterialSymbolsMenuRounded from '~icons/material-symbols/menu-rounded';
	import MaterialSymbolsCloseRounded from '~icons/material-symbols/close-rounded';
	import MaterialSymbolsChevronLeftRounded from '~icons/material-symbols/chevron-left-rounded';

	import Toaster from '$lib/components/Toaster.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import { adminHome, adminSections, visibleSections, type AdminSection } from './sections';

	let { children, data }: LayoutProps = $props();
	let isExpanded = $state(true);
	let mobileOpen = $state(false);

	let sections = $derived<AdminSection[]>([
		adminHome,
		...visibleSections(adminSections, data.user?.roles)
	]);

	function isActive(href: string): boolean {
		const path = page.url.pathname;
		if (href === '/admin') return path === '/admin';
		return path === href || path.startsWith(href + '/');
	}
</script>

{#snippet tab(section: AdminSection, expanded: boolean)}
	{@const Icon = section.icon}
	<a
		href={section.href}
		onclick={() => (mobileOpen = false)}
		aria-current={isActive(section.href) ? 'page' : undefined}
		class="flex items-center rounded-lg font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white {expanded
			? 'gap-2 px-4 py-2 text-lg'
			: 'h-12 w-12 justify-center'} {isActive(section.href) ? 'bg-gray-800 text-white' : ''}"
	>
		<div class="flex w-7 flex-shrink-0 justify-center">
			<Icon class="h-7 w-7" />
		</div>
		{#if expanded}
			<span class="overflow-hidden whitespace-nowrap">{section.label()}</span>
		{/if}
	</a>
{/snippet}

{#snippet brand(expanded: boolean)}
	<span class="flex items-center gap-2 text-white">
		<IconParkSolidShield class="h-7 w-7 flex-shrink-0" />
		{#if expanded}<span class="text-xl font-bold whitespace-nowrap">{m.admin_panel()}</span>{/if}
	</span>
{/snippet}

<div
	class="flex h-screen flex-col lg:grid lg:transition-[grid-template-columns] lg:duration-300 {isExpanded
		? 'lg:grid-cols-[280px_1fr]'
		: 'lg:grid-cols-[80px_1fr]'}"
>
	<!-- Desktop sidebar -->
	<nav
		class="relative hidden flex-col gap-2 overflow-y-auto border-r border-gray-800 bg-gray-900/50 p-4 lg:flex {!isExpanded
			? 'items-center'
			: ''}"
	>
		<div class="mb-6 flex justify-center">{@render brand(isExpanded)}</div>
		<button
			class="absolute top-10 -right-4 z-10 rounded-full bg-gray-800 p-1 text-white hover:bg-gray-700"
			onclick={() => (isExpanded = !isExpanded)}
			aria-label={m.toggle_sidebar()}
			title={m.toggle_sidebar()}
		>
			<MaterialSymbolsChevronLeftRounded
				class="h-6 w-6 transition-transform duration-300 {isExpanded ? '' : 'rotate-180'}"
			/>
		</button>
		{#each sections as section (section.href)}
			{@render tab(section, isExpanded)}
		{/each}
	</nav>

	<!-- Mobile top bar -->
	<header
		class="flex items-center gap-3 border-b border-gray-800 bg-gray-900/50 p-3 lg:hidden"
	>
		<button
			onclick={() => (mobileOpen = true)}
			aria-label={m.open_menu()}
			title={m.open_menu()}
			class="rounded-lg p-1 text-gray-300 hover:bg-gray-800 hover:text-white"
		>
			<MaterialSymbolsMenuRounded class="h-6 w-6" />
		</button>
		{@render brand(true)}
	</header>

	<!-- Mobile drawer -->
	{#if mobileOpen}
		<div class="fixed inset-0 z-50 lg:hidden">
			<button
				class="absolute inset-0 bg-black/50"
				onclick={() => (mobileOpen = false)}
				aria-label={m.close()}
				tabindex="-1"
			></button>
			<nav
				class="absolute top-0 left-0 flex h-full w-72 flex-col gap-2 overflow-y-auto border-r border-gray-800 bg-gray-900 p-4"
			>
				<div class="mb-4 flex items-center justify-between">
					{@render brand(true)}
					<button
						onclick={() => (mobileOpen = false)}
						aria-label={m.close()}
						title={m.close()}
						class="rounded-lg p-1 text-gray-300 hover:bg-gray-800 hover:text-white"
					>
						<MaterialSymbolsCloseRounded class="h-6 w-6" />
					</button>
				</div>
				{#each sections as section (section.href)}
					{@render tab(section, true)}
				{/each}
			</nav>
		</div>
	{/if}

	<main class="styled-scrollbar flex-1 overflow-auto p-4 lg:p-8">
		{@render children()}
	</main>
</div>

<Toaster />
<ConfirmDialog />
