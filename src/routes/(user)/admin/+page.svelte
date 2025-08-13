<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import IconParkSolidUser from '~icons/icon-park-solid/user';
	import IconParkSolidPeople from '~icons/icon-park-solid/people';
	import IconParkSolidSetting from '~icons/icon-park-solid/setting';
	import IconParkSolidEveryUser from '~icons/icon-park-solid/every-user';
	import IconParkSolidCalendar from '~icons/icon-park-solid/calendar';
	import IconParkSolidHistory from '~icons/icon-park-solid/history-query';
	import IconParkSolidTrophy from '~icons/icon-park-solid/trophy';
	import IconParkSolidGame from '~icons/icon-park-solid/game';
	import IconParkSolidMessage from '~icons/icon-park-solid/message';
	import type { Component } from 'svelte';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{m.admin_panel()} | LemonTV</title>
</svelte:head>

{#snippet adminCard(
	href: string,
	Icon: Component,
	title: string,
	description: string,
	color: 'blue' | 'green' | 'red' | 'purple' | 'yellow'
)}
	<a
		{href}
		class="group flex flex-col items-center rounded-xl bg-gray-800/70 p-6 shadow transition-colors hover:bg-gray-700"
	>
		<Icon
			class="mb-3 h-10 w-10 transition-colors {color === 'blue'
				? 'text-blue-400 group-hover:text-blue-300'
				: color === 'green'
					? 'text-green-400 group-hover:text-green-300'
					: color === 'red'
						? 'text-red-400 group-hover:text-red-300'
						: color === 'purple'
							? 'text-purple-400 group-hover:text-purple-300'
							: 'text-yellow-400 group-hover:text-yellow-300'}"
		/>
		<span class="mb-1 text-xl font-semibold text-white">{title}</span>
		<span class="text-center text-sm text-gray-400">{description}</span>
	</a>
{/snippet}

<div class="mb-8">
	<h1 class="mb-2 text-3xl font-bold text-white">{m.admin_panel()}</h1>
	<p class="text-lg text-gray-400">{m.welcome_admin()}</p>
</div>

<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
	{#if data.user?.roles.includes('admin')}
		{@render adminCard(
			'/admin/users',
			IconParkSolidUser,
			m.users(),
			m.admin_users_desc ? m.admin_users_desc() : 'Manage all users, roles, and permissions.',
			'blue'
		)}
	{/if}
	{@render adminCard(
		'/admin/players',
		IconParkSolidPeople,
		m.players(),
		m.admin_players_desc(),
		'green'
	)}
	{@render adminCard(
		'/admin/teams',
		IconParkSolidEveryUser,
		m.teams(),
		m.admin_teams_desc(),
		'red'
	)}
	{@render adminCard(
		'/admin/events',
		IconParkSolidCalendar,
		m.events(),
		m.admin_events_desc(),
		'purple'
	)}
	{@render adminCard(
		'/admin/matches',
		IconParkSolidGame,
		m.matches(),
		m.admin_matches_desc(),
		'blue'
	)}
	{@render adminCard(
		'/admin/organizers',
		IconParkSolidTrophy,
		m.organizers(),
		m.admin_organizers_desc(),
		'yellow'
	)}
	{@render adminCard(
		'/admin/community',
		IconParkSolidMessage,
		m.community(),
		m.admin_community_desc(),
		'purple'
	)}
	{@render adminCard(
		'/admin/edit-history',
		IconParkSolidHistory,
		m['editing.history.edit_history'](),
		m['editing.history.edit_history_desc'](),
		'yellow'
	)}
	{#if data.user?.roles.includes('admin')}
		{@render adminCard(
			'/admin/settings',
			IconParkSolidSetting,
			m.settings ? m.settings() : 'Settings',
			m.admin_settings_desc(),
			'yellow'
		)}
	{/if}
</div>
