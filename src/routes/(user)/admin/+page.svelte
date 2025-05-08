<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import IconParkSolidUser from '~icons/icon-park-solid/user';
	import IconParkSolidPeople from '~icons/icon-park-solid/people';
	import IconParkSolidSetting from '~icons/icon-park-solid/setting';
	import IconParkSolidEveryUser from '~icons/icon-park-solid/every-user';
	import IconParkSolidCalendar from '~icons/icon-park-solid/calendar';
	import type { Component } from 'svelte';
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
	{@render adminCard(
		'/admin/users',
		IconParkSolidUser,
		m.users(),
		m.admin_users_desc ? m.admin_users_desc() : 'Manage all users, roles, and permissions.',
		'blue'
	)}
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
		'/admin/settings',
		IconParkSolidSetting,
		m.settings ? m.settings() : 'Settings',
		m.admin_settings_desc(),
		'yellow'
	)}
</div>
