<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import IconParkSolidUser from '~icons/icon-park-solid/user';
	import IconParkSolidPeople from '~icons/icon-park-solid/people';
	import IconParkSolidSetting from '~icons/icon-park-solid/setting';
	import IconParkSolidEveryUser from '~icons/icon-park-solid/every-user';
	import IconParkSolidCalendar from '~icons/icon-park-solid/calendar';
</script>

<svelte:head>
	<title>{m.admin_panel()} | LemonTV</title>
</svelte:head>

<div class="mb-8">
	<h1 class="mb-2 text-3xl font-bold text-white">{m.admin_panel()}</h1>
	<p class="text-lg text-gray-400">{m.welcome_admin()}</p>
</div>

<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
	<a
		href="/admin/users"
		class="group flex flex-col items-center rounded-xl bg-gray-800/70 p-6 shadow transition-colors hover:bg-gray-700"
	>
		<IconParkSolidUser
			class="mb-3 h-10 w-10 text-blue-400 transition-colors group-hover:text-blue-300"
		/>
		<span class="mb-1 text-xl font-semibold text-white">{m.users()}</span>
		<span class="text-center text-sm text-gray-400"
			>{m.admin_users_desc
				? m.admin_users_desc()
				: 'Manage all users, roles, and permissions.'}</span
		>
	</a>
	<a
		href="/admin/players"
		class="group flex flex-col items-center rounded-xl bg-gray-800/70 p-6 shadow transition-colors hover:bg-gray-700"
	>
		<IconParkSolidPeople
			class="mb-3 h-10 w-10 text-green-400 transition-colors group-hover:text-green-300"
		/>
		<span class="mb-1 text-xl font-semibold text-white">{m.players()}</span>
		<span class="text-center text-sm text-gray-400">{m.admin_players_desc()}</span>
	</a>
	<a
		href="/admin/teams"
		class="group flex flex-col items-center rounded-xl bg-gray-800/70 p-6 shadow transition-colors hover:bg-gray-700"
	>
		<IconParkSolidEveryUser
			class="mb-3 h-10 w-10 text-red-400 transition-colors group-hover:text-red-300"
		/>
		<span class="mb-1 text-xl font-semibold text-white">{m.teams()}</span>
		<span class="text-center text-sm text-gray-400">{m.admin_teams_desc()}</span>
	</a>
	<a
		href="/admin/events"
		class="group flex flex-col items-center rounded-xl bg-gray-800/70 p-6 shadow transition-colors hover:bg-gray-700"
	>
		<IconParkSolidCalendar
			class="mb-3 h-10 w-10 text-purple-400 transition-colors group-hover:text-purple-300"
		/>
		<span class="mb-1 text-xl font-semibold text-white">{m.events()}</span>
		<span class="text-center text-sm text-gray-400">{m.admin_events_desc()}</span>
	</a>
	<a
		href="/admin/settings"
		class="group flex flex-col items-center rounded-xl bg-gray-800/70 p-6 shadow transition-colors hover:bg-gray-700"
	>
		<IconParkSolidSetting
			class="mb-3 h-10 w-10 text-yellow-400 transition-colors group-hover:text-yellow-300"
		/>
		<span class="mb-1 text-xl font-semibold text-white"
			>{m.settings ? m.settings() : 'Settings'}</span
		>
		<span class="text-center text-sm text-gray-400">{m.admin_settings_desc()}</span>
	</a>
</div>
