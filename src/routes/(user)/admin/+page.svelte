<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import type { Component } from 'svelte';
	import type { PageData } from './$types';
	import { adminSections, visibleSections, type AdminCardColor } from './sections';

	let { data }: { data: PageData } = $props();

	let sections = $derived(visibleSections(adminSections, data.user?.roles).filter((s) => s.card));

	const cardColorClasses: Record<AdminCardColor, string> = {
		blue: 'text-blue-400 group-hover:text-blue-300',
		green: 'text-green-400 group-hover:text-green-300',
		red: 'text-red-400 group-hover:text-red-300',
		purple: 'text-purple-400 group-hover:text-purple-300',
		yellow: 'text-yellow-400 group-hover:text-yellow-300'
	};

	let stats = $derived(
		data.stats
			? [
					{ label: m.players(), value: data.stats.players, href: '/admin/players' },
					{ label: m.teams(), value: data.stats.teams, href: '/admin/teams' },
					{ label: m.events(), value: data.stats.events, href: '/admin/events' },
					{ label: m.matches(), value: data.stats.matches, href: '/admin/matches' },
					{ label: m.organizers(), value: data.stats.organizers, href: '/admin/organizers' },
					{ label: m.trash_title(), value: data.stats.trashed, href: '/admin/trash' }
				]
			: []
	);
</script>

{#snippet adminCard(
	href: string,
	Icon: Component,
	title: string,
	description: string,
	color: AdminCardColor
)}
	<a
		{href}
		class="group flex flex-col items-center rounded-xl bg-gray-800/70 p-6 text-center shadow transition-colors hover:bg-gray-700"
	>
		<Icon class="mb-3 h-10 w-10 transition-colors {cardColorClasses[color]}" />
		<span class="mb-1 text-xl font-semibold text-white">{title}</span>
		<span class="text-sm text-gray-400">{description}</span>
	</a>
{/snippet}

<div class="mb-8">
	<h1 class="mb-2 text-3xl font-bold text-white">{m.admin_panel()}</h1>
	<p class="text-lg text-gray-400">{m.welcome_admin()}</p>
</div>

{#if stats.length > 0}
	<div class="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
		{#each stats as stat (stat.href)}
			<a
				href={stat.href}
				class="flex flex-col items-center rounded-xl bg-gray-800/70 p-4 shadow transition-colors hover:bg-gray-700"
			>
				<span class="text-2xl font-bold text-white">{stat.value}</span>
				<span class="text-center text-xs text-gray-400">{stat.label}</span>
			</a>
		{/each}
	</div>
{/if}

<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
	{#each sections as section (section.href)}
		{@render adminCard(
			section.href,
			section.icon,
			section.label(),
			section.description?.() ?? '',
			section.color ?? 'blue'
		)}
	{/each}
</div>
