<script lang="ts">
	import type { LayoutProps } from './$types';
	import { page } from '$app/state';
	import { m } from '$lib/paraglide/messages';

	import IconParkSolidUser from '~icons/icon-park-solid/user';
	import IconParkSolidUserPositioning from '~icons/icon-park-solid/user-positioning';
	import IconParkSolidLock from '~icons/icon-park-solid/lock';
	import IconParkSolidSetting from '~icons/icon-park-solid/setting';
	import type { Component } from 'svelte';

	let { children, data }: LayoutProps = $props();
	let isExpanded = $state(true);

	function togglePanel() {
		isExpanded = !isExpanded;
	}
</script>

<svelte:head>
	<title>{m.profile_settings()} | LemonTV</title>
</svelte:head>

{#snippet tab(href: string, Icon: Component, label: string)}
	<a
		class="flex items-center rounded-lg transition-all duration-300 {isExpanded
			? 'gap-2 px-4 py-2'
			: 'h-12 w-12 justify-center'} text-lg font-medium text-gray-300 hover:bg-gray-800 hover:text-white {page
			.url.pathname === href
			? 'bg-gray-800 text-white'
			: ''} {!isExpanded ? 'text-center text-base' : ''}"
		{href}
	>
		<div class="flex w-7 flex-shrink-0 justify-center">
			<Icon class="h-7 w-7" />
		</div>
		<span
			class="overflow-hidden whitespace-nowrap transition-all duration-300 {isExpanded
				? 'ml-2 w-auto opacity-100'
				: 'ml-0 w-0 opacity-0'}">{label}</span
		>
	</a>
{/snippet}

<div
	class="grid h-screen transition-[grid-template-columns] duration-300 {isExpanded
		? 'grid-cols-[280px_1fr]'
		: 'grid-cols-[80px_1fr]'}"
>
	<nav
		class="relative flex flex-col gap-4 border-r border-gray-800 bg-gray-900/50 p-6 transition-all duration-300 {!isExpanded
			? 'items-center px-2'
			: ''}"
	>
		<div class="mb-6 flex flex-col items-center">
			<h1 class="flex items-center justify-center text-2xl font-bold text-white">
				<IconParkSolidUserPositioning class="h-7 w-7 text-white" />
				<span
					class="overflow-hidden whitespace-nowrap transition-all duration-300 {isExpanded
						? 'ml-4 w-auto opacity-100'
						: 'ml-0 w-0 opacity-0'} text-xl font-bold text-white"
				>
					{m.profile_settings()}
				</span>
			</h1>
		</div>
		<button
			class="absolute top-12 -right-4 rounded-full bg-gray-800 p-1 text-white hover:bg-gray-700"
			onclick={togglePanel}
			aria-label={isExpanded ? 'Collapse panel' : 'Expand panel'}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6 transition-transform duration-300 {isExpanded ? '' : 'rotate-180'}"
				viewBox="0 0 20 20"
				fill="currentColor"
			>
				<path
					fill-rule="evenodd"
					d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
					clip-rule="evenodd"
				/>
			</svg>
		</button>

		{@render tab('/profile', IconParkSolidUser, m.account())}
		{@render tab('/profile/security', IconParkSolidLock, m.security())}
		{@render tab('/profile/preferences', IconParkSolidSetting, m.preferences())}
	</nav>
	<main class="overflow-auto p-8">
		{@render children()}
	</main>
</div>
